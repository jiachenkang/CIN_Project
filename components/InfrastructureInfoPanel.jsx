import React from 'react';
import { Card, CardContent, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const InfrastructureInfoPanel = ({ object, onClose }) => {
  if (!object) return null;

  const renderContent = () => {
    if (object.hierarchy_level === 1) {
      return (
        <>
          <Typography variant="h6" gutterBottom>Level 1: {object.name}</Typography>
          <Typography variant="body2">Code: {object.code}</Typography>
          <Typography variant="body2">Type: {object.type?.toUpperCase()}</Typography>
          <Typography variant="body2">Capacity: {object.capacity}</Typography>
          <Typography variant="body2">Output Voltage: {object.voltage_output}</Typography>
          <Typography variant="body2">Status: {object.status}</Typography>
          <Typography variant="body2">Operator: {object.operator}</Typography>
          <Typography variant="body2">Fuel: {object.fuel_type}</Typography>
          <Typography variant="body2">Efficiency: {(object.efficiency * 100).toFixed(1)}%</Typography>
          <Typography variant="body2">Risk Level: {object.risk_level}</Typography>
        </>
      );
    } else if (object.hierarchy_level === 2) {
      return (
        <>
          <Typography variant="h6" gutterBottom>Level 2: {object.name}</Typography>
          <Typography variant="body2">Code: {object.code}</Typography>
          <Typography variant="body2">Type: {object.type?.toUpperCase()}</Typography>
          <Typography variant="body2">Input Voltage: {object.voltage_input}</Typography>
          <Typography variant="body2">Output Voltage: {object.voltage_output}</Typography>
          <Typography variant="body2">Capacity: {object.capacity}</Typography>
          <Typography variant="body2">Status: {object.status}</Typography>
          <Typography variant="body2">Risk Level: {object.risk_level}</Typography>
        </>
      );
    } else if (object.hierarchy_level === 3) {
      return (
        <>
          <Typography variant="h6" gutterBottom>Level 3: Transformer {object.code}</Typography>
          <Typography variant="body2">Type: {object.type?.replace('_', ' ').toUpperCase()}</Typography>
          <Typography variant="body2">Input Voltage: {object.voltage_input}</Typography>
          <Typography variant="body2">Output Voltage: {object.voltage_output}</Typography>
          <Typography variant="body2">Capacity: {object.capacity}</Typography>
          <Typography variant="body2">Status: {object.status}</Typography>
          <Typography variant="body2">Risk Level: {object.risk_level}</Typography>
        </>
      );
    } else if (object.hierarchy_level === 4) {
      return (
        <>
          <Typography variant="h6" gutterBottom>Level 4: Communication Tower</Typography>
          <Typography variant="body2">Code: {object.code}</Typography>
          <Typography variant="body2">Address: {object.address}</Typography>
          <Typography variant="body2">Structure: {object.structures}</Typography>
          <Typography variant="body2">Network: {object.networks}</Typography>
          <Typography variant="body2">Power Consumption: {object.power_consumption}</Typography>
          <Typography variant="body2">Impact Duration: {object.impact}</Typography>
          <Typography variant="body2">Backup Power: {object.backup}</Typography>
          <Typography variant="body2">Risk Level: {object.risk}</Typography>
        </>
      );
    }
    return null;
  };

  return (
    <Card sx={{ 
      width: 300, 
      maxHeight: '60vh',
      overflowY: 'auto',
      position: 'relative',
      backgroundColor: 'rgba(255, 74, 74, 0.9)',
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
      </CardContent>
    </Card>
  );
};

export default InfrastructureInfoPanel;

