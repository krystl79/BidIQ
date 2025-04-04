import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
  TextField,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import apiService, { Equipment, EquipmentCategory } from '../services/api';

interface SelectedEquipment extends Equipment {
  quantity: number;
  duration: 'daily' | 'weekly' | 'monthly';
}

interface ProjectInfo {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  projectType: string;
  requirements: string[];
}

const EquipmentSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const projectInfo = location.state?.projectInfo as ProjectInfo;
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<SelectedEquipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEquipmentDetails, setSelectedEquipmentDetails] = useState<Equipment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!projectInfo) {
      navigate('/project-input');
      return;
    }
    loadCategories();
  }, [navigate, projectInfo]);

  useEffect(() => {
    if (selectedCategory) {
      loadEquipmentByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await apiService.getCategories();
      setCategories(categoriesData);
      
      // If there are project requirements, try to match them with categories
      if (projectInfo?.requirements) {
        const matchingCategory = categoriesData.find(category =>
          projectInfo.requirements.some(req =>
            category.name.toLowerCase().includes(req.toLowerCase())
          )
        );
        if (matchingCategory) {
          setSelectedCategory(matchingCategory.id);
        }
      }
    } catch (err) {
      setError('Failed to load equipment categories.');
      console.error('Categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEquipmentByCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      const equipmentData = await apiService.getEquipmentByCategory(categoryId);
      setEquipment(equipmentData);
    } catch (err) {
      setError('Failed to load equipment.');
      console.error('Equipment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      const searchResults = await apiService.searchEquipment(searchQuery);
      setEquipment(searchResults);
    } catch (err) {
      setError('Failed to search equipment.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = (equipment: Equipment) => {
    setSelectedEquipment(prev => [
      ...prev,
      {
        ...equipment,
        quantity: 1,
        duration: 'daily',
      },
    ]);
  };

  const handleQuantityChange = (equipmentId: string, quantity: number) => {
    setSelectedEquipment(prev =>
      prev.map(item =>
        item.id === equipmentId ? { ...item, quantity } : item
      )
    );
  };

  const handleDurationChange = (equipmentId: string, duration: 'daily' | 'weekly' | 'monthly') => {
    setSelectedEquipment(prev =>
      prev.map(item =>
        item.id === equipmentId ? { ...item, duration } : item
      )
    );
  };

  const handleRemoveEquipment = (equipmentId: string) => {
    setSelectedEquipment(prev =>
      prev.filter(item => item.id !== equipmentId)
    );
  };

  const handleViewDetails = async (equipment: Equipment) => {
    try {
      const details = await apiService.getEquipmentDetails(equipment.id);
      setSelectedEquipmentDetails(details);
      setDialogOpen(true);
    } catch (err) {
      setError('Failed to load equipment details.');
      console.error('Details error:', err);
    }
  };

  const calculateTotalCost = () => {
    return selectedEquipment.reduce((total, item) => {
      const rate = item.rental_price;
      const quantity = item.quantity;
      const duration = item.duration;
      let multiplier = 1;

      switch (duration) {
        case 'weekly':
          multiplier = 7;
          break;
        case 'monthly':
          multiplier = 30;
          break;
        default:
          multiplier = 1;
      }

      return total + rate * quantity * multiplier;
    }, 0);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Equipment Selection
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Select equipment for {projectInfo?.name || 'your project'} and specify quantities and rental duration.
        </Typography>

        {/* Project Summary */}
        <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Project Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1">{projectInfo?.description}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Timeline
              </Typography>
              <Typography variant="body1">
                {projectInfo?.startDate} - {projectInfo?.endDate}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Location
              </Typography>
              <Typography variant="body1">{projectInfo?.location}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Project Type
              </Typography>
              <Typography variant="body1">{projectInfo?.projectType}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={3}>
          {/* Search and Categories */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                fullWidth
                label="Search Equipment"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  label={category.name}
                  onClick={() => setSelectedCategory(category.id)}
                  color={selectedCategory === category.id ? 'primary' : 'default'}
                />
              ))}
            </Box>
          </Grid>

          {/* Equipment List */}
          <Grid item xs={12} md={8}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2}>
                {equipment.map((item) => (
                  <Grid item xs={12} sm={6} key={item.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {item.description}
                        </Typography>
                        <Typography variant="h6" color="primary">
                          ${item.rental_price.toLocaleString()} / day
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {Object.entries(item.specifications).map(([key, value]) => (
                            <Chip
                              key={key}
                              label={`${key}: ${value}`}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          startIcon={<InfoIcon />}
                          onClick={() => handleViewDetails(item)}
                        >
                          Details
                        </Button>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddEquipment(item)}
                        >
                          Add
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>

          {/* Selected Equipment */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Selected Equipment
              </Typography>
              {selectedEquipment.map((item) => (
                <Box key={item.id} sx={{ mb: 2 }}>
                  <Typography variant="subtitle1">{item.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                    <TextField
                      size="small"
                      type="number"
                      label="Quantity"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                      InputProps={{ inputProps: { min: 1 } }}
                      sx={{ width: 100 }}
                    />
                    <TextField
                      size="small"
                      select
                      label="Duration"
                      value={item.duration}
                      onChange={(e) => handleDurationChange(item.id, e.target.value as 'daily' | 'weekly' | 'monthly')}
                      SelectProps={{ native: true }}
                      sx={{ width: 120 }}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </TextField>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemoveEquipment(item.id)}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Total Cost
              </Typography>
              <Typography variant="h4" color="primary">
                ${calculateTotalCost().toLocaleString()}
              </Typography>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/bid-review')}
              >
                Continue to Review
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Equipment Details Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedEquipmentDetails && (
            <>
              <DialogTitle>{selectedEquipmentDetails.name}</DialogTitle>
              <DialogContent>
                <Typography variant="body1" paragraph>
                  {selectedEquipmentDetails.description}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Specifications
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(selectedEquipmentDetails.specifications).map(([key, value]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {key}
                      </Typography>
                      <Typography variant="body1">{value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialogOpen(false)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Paper>
    </Container>
  );
};

export default EquipmentSelection; 