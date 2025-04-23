import React, { useState, useEffect } from 'react';
import { getBid, saveBid } from '../services/db';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const AddItemsToBid = ({ bidId, onClose, onSave }) => {
  const [bid, setBid] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    quantity: 1,
    cost: ''
  });

  useEffect(() => {
    const loadBid = async () => {
      try {
        const bidData = await getBid(bidId);
        setBid(bidData);
        setItems(bidData.additionalItems || []);
      } catch (error) {
        console.error('Error loading bid:', error);
        setError('Failed to load bid data');
      } finally {
        setIsLoading(false);
      }
    };

    loadBid();
  }, [bidId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cost') {
      // Remove any non-digit characters except decimal point
      const cleanValue = value.replace(/[^\d.]/g, '');
      // Ensure only two decimal places
      const parts = cleanValue.split('.');
      if (parts[1]?.length > 2) {
        parts[1] = parts[1].substring(0, 2);
        const formattedValue = parts.join('.');
        setNewItem(prev => ({
          ...prev,
          [name]: formattedValue
        }));
        return;
      }
      setNewItem(prev => ({
        ...prev,
        [name]: cleanValue
      }));
    } else if (name === 'quantity') {
      setNewItem(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setNewItem(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.description || newItem.quantity <= 0 || !newItem.cost || parseFloat(newItem.cost) <= 0) {
      setError('Please fill in all fields with valid values');
      return;
    }

    const itemToAdd = {
      ...newItem,
      cost: parseFloat(newItem.cost),
      totalCost: newItem.quantity * parseFloat(newItem.cost)
    };

    setItems(prev => [...prev, itemToAdd]);
    setNewItem({
      name: '',
      description: '',
      quantity: 1,
      cost: ''
    });
    setError(null);
  };

  const handleRemoveItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const calculateTotalAdditionalCost = () => {
    return items.reduce((total, item) => total + (item.quantity * item.cost), 0);
  };

  const handleSave = async () => {
    try {
      const updatedBid = {
        ...bid,
        additionalItems: items,
        totalCost: (bid.totalCost || 0) + calculateTotalAdditionalCost()
      };
      await saveBid(updatedBid);
      onSave && onSave(updatedBid);
      onClose();
    } catch (error) {
      console.error('Error saving bid:', error);
      setError('Failed to save changes');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Paper sx={{ p: 4, maxWidth: '90vw', width: 800 }}>
          <CircularProgress />
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{
      position: 'fixed',
      inset: 0,
      bgcolor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Paper sx={{ p: 4, maxWidth: '90vw', width: 800, maxHeight: '90vh', overflow: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">Add Ons</Typography>
          <IconButton onClick={onClose} size="large">
            <DeleteIcon />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>New Add On</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography sx={{ mb: 1 }}>Add On Name</Typography>
              <TextField
                fullWidth
                name="name"
                value={newItem.name}
                onChange={handleInputChange}
                placeholder="Enter add on name"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ mb: 1 }}>Description</Typography>
              <TextField
                fullWidth
                name="description"
                value={newItem.description}
                onChange={handleInputChange}
                placeholder="Enter description"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ mb: 1 }}>Quantity</Typography>
              <TextField
                fullWidth
                type="number"
                name="quantity"
                value={newItem.quantity}
                onChange={handleInputChange}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ mb: 1 }}>Cost per Unit</Typography>
              <TextField
                fullWidth
                name="cost"
                value={newItem.cost}
                onChange={handleInputChange}
                placeholder="0.00"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                }}
              />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            onClick={handleAddItem}
            fullWidth
            sx={{ mt: 2, py: 1.5, bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' } }}
          >
            Add
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Added Add Ons</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Add On</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Cost</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">${item.cost.toFixed(2)}</TableCell>
                    <TableCell align="right">${(item.quantity * item.cost).toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleRemoveItem(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                      Total Add Ons Cost:
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      ${calculateTotalAdditionalCost().toFixed(2)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          '& .MuiButton-root': {
            flex: 1,
            py: 1.5
          }
        }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ bgcolor: '#F9FAFB' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              bgcolor: '#3B82F6',
              '&:hover': {
                bgcolor: '#2563EB'
              }
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddItemsToBid; 