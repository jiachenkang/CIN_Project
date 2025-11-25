import React from 'react';
import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const InfrastructureInfoPanel = ({ object, onClose }) => {
  if (!object) return null;

  // Parse text with **bold** syntax and newlines
  const parseFormattedText = (text) => {
    if (!text) return null;
    
    // Split by **text** pattern while keeping the delimiters
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Bold text
        const boldText = part.slice(2, -2);
        return <strong key={i}>{boldText}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderMessage = (msg, index) => {
    const isSuggestion = msg.type === 'suggestion';
    const hasContent = msg.content && msg.content.trim() !== '';
    
    // Base styles
    let boxStyle = {
      borderRadius: 2,
      mb: 1,
      position: 'relative',
      overflow: 'hidden'
    };
    
    let contentStyle = {
      p: 1.5
    };

    if (msg.type === 'info') {
      boxStyle = {
        ...boxStyle,
        border: '2px solid #2e7d32',
        backgroundColor: '#e8f5e9',
        color: '#2e7d32'
      };
    } else if (msg.type === 'warning') {
      boxStyle = {
        ...boxStyle,
        border: '2px solid #fbc02d', // Darker yellow for border visibility
        backgroundColor: '#fff9c4', // Light yellow fill
        color: '#424242'
      };
    } else if (msg.type === 'error') {
      boxStyle = {
        ...boxStyle,
        border: '2px solid #c62828', // Dark red border
        backgroundColor: '#ef5350', // Red fill
        color: '#ffffff'
      };
    } else if (isSuggestion) {
       // Gradient border effect
       return (
        <Box key={index} sx={{
          background: 'conic-gradient(from 30deg,rgba(255, 0, 0, 0.5),rgba(255, 128, 0, 0.5),rgba(0, 255, 0, 0.5),rgba(0, 0, 255, 0.5),rgba(148, 0, 211, 0.5),rgba(255, 0, 0, 0.5))',
          padding: '2px',
          borderRadius: 2,
          mb: 1
        }}>
          <Box sx={{
            backgroundColor: '#ffffff',
            borderRadius: 'calc(8px - 2px)',
            p: 1.5,
            color: '#424242'
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.2, mb: hasContent ? 0.5 : 0 }}>
              {msg.title}
            </Typography>
            {hasContent && (
              <Typography variant="body2" component="div" sx={{ lineHeight: 1.2, whiteSpace: 'pre-line' }}>
                {parseFormattedText(msg.content)}
              </Typography>
            )}
          </Box>
        </Box>
       );
    }

    return (
      <Box key={index} sx={boxStyle}>
        <Box sx={contentStyle}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'inherit', lineHeight: 1.2, mb: hasContent ? 0.5 : 0 }}>
            {msg.title}
          </Typography>
          {hasContent && (
            <Typography variant="body2" component="div" sx={{ color: 'inherit', lineHeight: 1.2, whiteSpace: 'pre-line' }}>
              {parseFormattedText(msg.content)}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  const renderContent = () => {
    if (object.hierarchy_level === 1) {
      return (
        <>
          <Typography variant="h6" gutterBottom>{object.name}</Typography>
          <Typography variant="body3">Code: {object.code}<br/></Typography>
          <Typography variant="body3">Type: {object.type?.toUpperCase()}<br/></Typography>
          <Typography variant="body3">Capacity: {object.capacity}<br/></Typography>
          <Typography variant="body3">Output Voltage: {object.voltage_output}<br/></Typography>
          <Typography variant="body3">Status: {object.status}<br/></Typography>
          <Typography variant="body3">Operator: {object.operator}<br/></Typography>
          <Typography variant="body3">Fuel: {object.fuel_type}<br/></Typography>
          <Typography variant="body3">Efficiency: {(object.efficiency * 100).toFixed(1)}%<br/></Typography>
        </>
      );
    } else if (object.hierarchy_level === 2) {
      return (
        <>
          <Typography variant="h6" gutterBottom>{object.name}</Typography>
          <Typography variant="body3">Code: {object.code}<br/></Typography>
          <Typography variant="body3">Type: {object.type?.toUpperCase()}<br/></Typography>
          <Typography variant="body3">Input Voltage: {object.voltage_input}<br/></Typography>
          <Typography variant="body3">Output Voltage: {object.voltage_output}<br/></Typography>
          <Typography variant="body3">Capacity: {object.capacity}<br/></Typography>
        </>
      );
    } else if (object.hierarchy_level === 3) {
      return (
        <>
          <Typography variant="h6" gutterBottom>Transformer {object.code}</Typography>
          <Typography variant="body3">Type: {object.type?.replace('_', ' ').toUpperCase()}<br/></Typography>
          <Typography variant="body3">Input Voltage: {object.voltage_input}<br/></Typography>
          <Typography variant="body3">Output Voltage: {object.voltage_output}<br/></Typography>
          <Typography variant="body3">Capacity: {object.capacity}<br/></Typography>
        </>
      );
    } else if (object.hierarchy_level === 4) {
      return (
        <>
          <Typography variant="h6" gutterBottom>Tower {object.code}</Typography>
          <Typography variant="body3">Address: {object.address}<br/></Typography>
          <Typography variant="body3">Structure: {object.structures}<br/></Typography>
          <Typography variant="body3">Network: {object.networks}<br/></Typography>
          <Typography variant="body3">Power Consumption: {object.power_consumption}<br/></Typography>
        </>
      );
    }
    return null;
  };

  return (
    <Card sx={{ 
      width: 300, 
      maxHeight: '80vh',
      overflowY: 'auto',
      position: 'relative',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      boxShadow: 3
    }}>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
          zIndex: 1
        }}
      >
        <CloseIcon />
      </IconButton>
      <CardContent>
        {renderContent()}
        
        {object.messages && object.messages.length > 0 && (
          <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
            {object.messages.map((msg, index) => renderMessage(msg, index))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default InfrastructureInfoPanel;
