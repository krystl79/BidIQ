import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Calculate as CalculateIcon, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';

interface AnalysisResult {
  total_rental_cost: number;
  decision: string;
}

interface LiveRentalData {
  name: string;
  price: number;
}

const RentVsBuyAnalysis: React.FC = () => {
  const [equipment, setEquipment] = useState({
    name: '',
    purchase_price: '',
    rental_cost: '',
    usage_days: '',
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [liveRental, setLiveRental] = useState<LiveRentalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setEquipment({
      ...equipment,
      [field]: event.target.value,
    });
  };

  const fetchLiveRental = async (name: string) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/live-rental/${name}`);
      setLiveRental(response.data);
      setEquipment(prev => ({
        ...prev,
        rental_cost: response.data.price.toString(),
      }));
    } catch (err) {
      setError('Failed to fetch live rental rates.');
      console.error('Live rental error:', err);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://127.0.0.1:8000/rent-vs-buy/', {
        purchase_price: Number(equipment.purchase_price),
        rental_cost: Number(equipment.rental_cost),
        usage_days: Number(equipment.usage_days),
      });
      setResult(response.data);
    } catch (err) {
      setError('Failed to analyze. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Rent vs. Buy Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Compare the costs of renting versus buying equipment for your project.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Equipment Name"
                value={equipment.name}
                onChange={handleInputChange('name')}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                onClick={() => fetchLiveRental(equipment.name)}
                disabled={!equipment.name}
                fullWidth
                sx={{ height: '100%' }}
              >
                Get Live Rates
              </Button>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Purchase Price"
                type="number"
                value={equipment.purchase_price}
                onChange={handleInputChange('purchase_price')}
                required
                InputProps={{
                  inputProps: { min: 0 },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Daily Rental Cost"
                type="number"
                value={equipment.rental_cost}
                onChange={handleInputChange('rental_cost')}
                required
                InputProps={{
                  inputProps: { min: 0 },
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Usage Days"
                type="number"
                value={equipment.usage_days}
                onChange={handleInputChange('usage_days')}
                required
                InputProps={{
                  inputProps: { min: 1 },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <CalculateIcon />}
                disabled={loading}
                size="large"
              >
                Analyze
              </Button>
            </Grid>
          </Grid>
        </form>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {liveRental && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Live rental rate for {liveRental.name}: ${liveRental.price.toLocaleString()} per day
          </Alert>
        )}

        {result && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Analysis Results
            </Typography>
            <Paper elevation={2} sx={{ p: 3, bgcolor: 'background.default' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Rental Cost
                  </Typography>
                  <Typography variant="h5">
                    ${result.total_rental_cost.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Recommended Decision
                  </Typography>
                  <Typography
                    variant="h5"
                    color={result.decision === 'Buy' ? 'success.main' : 'primary.main'}
                  >
                    {result.decision}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default RentVsBuyAnalysis; 