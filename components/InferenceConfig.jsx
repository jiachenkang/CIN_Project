import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  IconButton,
  Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckIcon from '@mui/icons-material/Check';

// 1. Mock Data
const MOCK_DATA = {
  events: ['history_24_10_2022'],
  servers: ['steed_3@UTS', 'steed_4@UTS'],
  windows: ['24 Hours', '48 Hours'],
  steps: [
    { message: 'Connecting to server', duration: 1, progress: 5 },
    { message: 'Initialization', duration: 4, progress: 5 },
    { message: 'Loading Model', duration: 3, progress: 8 },
    { message: 'Loading Data', duration: 3, progress: 18 },
    { message: 'Inferencing', duration: 3, progress: 20 },
    { message: 'Writing results to NetCDF file', duration: 5, progress: 4 },
    { message: 'Generating TIF files', duration: 3, progress: 40 }
  ]
};

const InferenceConfig = ({ onClose }) => {
  // Config State
  const [event, setEvent] = useState(MOCK_DATA.events[0]);
  const [server, setServer] = useState(MOCK_DATA.servers[1]);
  const [windowSize, setWindowSize] = useState(MOCK_DATA.windows[0]);

  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);

  const [isCancelling, setIsCancelling] = useState(false);
  
  // Refs for animation loop
  const stateRef = useRef({
    stepIndex: 0,
    stepStartTime: 0,
    stepDuration: 0,
    stepStartProgress: 0,
    accumulatedProgress: 0,
    logs: []
  });
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStart = () => {
    setIsRunning(true);
    setIsDone(false);
    setIsCancelling(false);
    setProgress(0);
    setLogs([]);
    
    // Reset refs
    stateRef.current = {
      stepIndex: 0,
      stepStartTime: Date.now(),
      stepDuration: getRandomDuration(MOCK_DATA.steps[0].duration),
      stepStartProgress: 0,
      accumulatedProgress: 0,
      logs: [{ 
        message: MOCK_DATA.steps[0].message, 
        elapsed: 0,
        totalDuration: 0 // Placeholder, will be updated 
      }]
    };
    
    // Set totalDuration for the first log in the ref
    stateRef.current.logs[0].totalDuration = stateRef.current.stepDuration;
    setLogs([...stateRef.current.logs]);

    timerRef.current = setInterval(updateLoop, 100);
  };

  const handleCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // If not running, close immediately
    if (!isRunning) {
      onClose();
      return;
    }

    // If running, show cancelling status
    setIsCancelling(true);
    
    // Add cancelling message to logs
    const updatedLogs = [...logs, {
      message: 'Aborting process',
      elapsed: 0,
      totalDuration: 0
    }];
    setLogs(updatedLogs);
    
    // Wait 2 seconds then close
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleDone = () => {
    onClose(true); // Pass true to indicate success
  };

  const getRandomDuration = (baseDuration) => {
    // Random value within +/- 5%
    const variation = baseDuration * 0.1;
    const randomVar = (Math.random() * 2 - 1) * variation;
    return (baseDuration + randomVar) * 1000; // Convert to ms
  };

  const updateLoop = () => {
    const now = Date.now();
    const { stepIndex, stepStartTime, stepDuration, accumulatedProgress, stepStartProgress } = stateRef.current;

    if (stepIndex >= MOCK_DATA.steps.length) {
      finish();
      return;
    }

    const currentStepData = MOCK_DATA.steps[stepIndex];
    const elapsed = now - stepStartTime;

    // Update Log Timer
    const updatedLogs = [...stateRef.current.logs];
    if (updatedLogs.length > 0) {
      updatedLogs[updatedLogs.length - 1].elapsed = (elapsed / 1000).toFixed(1);
      setLogs(updatedLogs);
    }

    // Update Progress
    // Speed: (stepAmount * 0.7) / stepDuration (per ms)
    const stepTotalProgress = currentStepData.progress;
    const speed = (stepTotalProgress * 0.7) / stepDuration; 
    const progressIncrement = speed * elapsed;
    
    // Don't exceed the 70% mark of the step roughly, but logic says "linear increase"
    // The formula implies continuous linear growth based on elapsed time
    let currentTotalProgress = accumulatedProgress + progressIncrement;
    
    if (elapsed >= stepDuration) {
      // Step Finished
      completeStep(stepIndex, accumulatedProgress, stepTotalProgress);
    } else {
      setProgress(Math.min(currentTotalProgress, 99.9)); // Cap at 99.9 until done
    }
  };

  const completeStep = (index, previousAccumulated, stepTotalAmount) => {
    // Jump progress
    const newAccumulated = previousAccumulated + stepTotalAmount;
    stateRef.current.accumulatedProgress = newAccumulated;
    setProgress(Math.min(newAccumulated, 100));

    const nextIndex = index + 1;
    stateRef.current.stepIndex = nextIndex;

    if (nextIndex < MOCK_DATA.steps.length) {
      // Prepare next step
      const nextStepData = MOCK_DATA.steps[nextIndex];
      const nextDuration = getRandomDuration(nextStepData.duration);
      
      stateRef.current.stepStartTime = Date.now();
      stateRef.current.stepDuration = nextDuration;
      stateRef.current.stepStartProgress = newAccumulated;
      
      // Add new log
      stateRef.current.logs.push({
        message: nextStepData.message,
        elapsed: 0,
        totalDuration: nextDuration
      });
      setLogs([...stateRef.current.logs]);
    } else {
      finish();
    }
  };

  const finish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setIsDone(true);
    setProgress(100);
  };

  return (
    <Fade in={true}>
      <Paper
        elevation={24}
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 450,
          height: 600,
          zIndex: 13,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 2,
          bgcolor: 'background.paper'
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Inference Config
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3, overflowY: 'auto' }}>
          
          {/* Configuration Section - Disable when running/done/cancelling */}
          <FormControl fullWidth disabled={isRunning || isDone || isCancelling} size="small">
            <InputLabel>Event Selection</InputLabel>
            <Select
              value={event}
              label="Event Selection"
              onChange={(e) => setEvent(e.target.value)}
            >
              {MOCK_DATA.events.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={isRunning || isDone || isCancelling} size="small">
            <InputLabel>Server Selection</InputLabel>
            <Select
              value={server}
              label="Server Selection"
              onChange={(e) => setServer(e.target.value)}
            >
              {MOCK_DATA.servers.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={isRunning || isDone || isCancelling} size="small">
            <InputLabel>Inference Window</InputLabel>
            <Select
              value={windowSize}
              label="Inference Window"
              onChange={(e) => setWindowSize(e.target.value)}
            >
              {MOCK_DATA.windows.map(w => <MenuItem key={w} value={w}>{w}</MenuItem>)}
            </Select>
          </FormControl>

          {/* Results Section */}
          {(isRunning || isDone || isCancelling) && (
            <Box sx={{ mt: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: 'text.secondary' }}>
                Running Status
              </Typography>
              
              {/* Logs */}
              <Paper 
                variant="outlined" 
                sx={{ 
                  flexGrow: 1, 
                  bgcolor: '#f5f5f5', 
                  p: 2, 
                  overflowY: 'auto', 
                  maxHeight: 200,
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  mb: 2
                }}
              >
                {logs.map((log, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" component="span" sx={{ fontFamily: 'inherit' }}>
                      {log.message}...
                    </Typography>
                    <Typography variant="body2" component="span" sx={{ fontFamily: 'inherit', color: 'text.secondary' }}>
                      {log.elapsed}s
                    </Typography>
                  </Box>
                ))}
              </Paper>

              {/* Progress Bar */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress 
                    variant={isCancelling ? "indeterminate" : "determinate"} 
                    value={progress} 
                    color={isCancelling ? "error" : "primary"}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">{`${Math.round(progress)}%`}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {/* Footer Actions */}
        <Box sx={{ p: 3, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          
          {/* Start Button - Show only when initial */}
          {!isRunning && !isDone && !isCancelling && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<PlayArrowIcon />}
              onClick={handleStart}
              fullWidth
              size="large"
            >
              Start Inference
            </Button>
          )}

          {/* Cancel Button - Show when running */}
          {isRunning && !isCancelling && (
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleCancel}
              fullWidth
            >
              Cancel
            </Button>
          )}

          {/* Cancelling State - Show Disabled Cancel Button */}
          {isCancelling && (
            <Button 
              variant="outlined" 
              color="error" 
              disabled
              fullWidth
            >
              Cancelling...
            </Button>
          )}

          {/* Done Button - Show when finished */}
          {isDone && !isCancelling && (
            <>
              <Button 
                variant="outlined" 
                onClick={handleCancel}
                color="inherit"
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<CheckIcon />}
                onClick={handleDone}
                fullWidth
              >
                Done
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Fade>
  );
};

export default InferenceConfig;

