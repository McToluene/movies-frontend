'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Typography, Container, Box, Grid, CircularProgress } from '@mui/material';
import { Accept, useDropzone } from 'react-dropzone';

import AlertMessage from '@/components/alertMessage';
import Image from 'next/image';
import { MoviesContext } from '@/app/state/movieContext';
import Input from '@/components/input';
import { Download } from '@mui/icons-material';

export default function AddMoviePage() {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  const { dispatch } = useContext(MoviesContext);
  const router = useRouter();

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setFile(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*' as unknown as Accept,
  });

  const handleSubmit = async () => {
    setLoading(true);
    if (!title || !year || !file) {
      setAlertMessage('Please fill in all fields.');
      setAlertSeverity('error');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('year', year);
    formData.append('file', file);

    try {
      const response = await fetch('/api/movies', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        setAlertMessage(data.message || 'Failed to add movie');
        setAlertSeverity('error');
        return;
      }

      setAlertMessage('Movie added successfully!');
      setAlertSeverity('success');

      const movie = await response.json();
      dispatch({ type: 'ADD_MOVIE', payload: movie });
      setLoading(false);
      router.push('/movies');
    } catch (error) {
      setAlertMessage('An unexpected error occurred');
      setAlertSeverity('error');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleCloseAlert = () => {
    setAlertMessage(null);
  };

  return (
    <Container
      maxWidth='md'
      sx={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box sx={{ width: '100%' }}>
        <Typography component='h4' variant='h4' sx={{ mb: 4, fontWeight: 'bold' }}>
          Create a new movie
        </Typography>
        <Grid mt={5} container alignItems='flex-start' spacing={10}>
          <Grid item xs={12} md={6}>
            <Box
              {...getRootProps()}
              sx={{
                borderRadius: '8px',
                border: '2px dashed #ccc',
                padding: '20px',
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: { xs: '300px', md: '400px' },
              }}
            >
              <input {...getInputProps()} />
              <Download sx={{ fontSize: 24, mb: 2 }} />
              <Typography>Drag an image here</Typography>
              {image && (
                <Box mt={2}>
                  <Image src={image} alt='Preview' width={200} height={200} />
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Input
              label='Title'
              name='title'
              type='text'
              error={false}
              value={title}
              fullWidth={true}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              label='Publishing year'
              name='year'
              type='text'
              error={false}
              value={year}
              fullWidth={false}
              onChange={(e) => setYear(e.target.value)}
            />
            <Box mt={8} sx={{ display: 'flex', justifyContent: 'space-between', gap: 5 }}>
              <Button
                disabled={loading}
                size='large'
                variant='outlined'
                color='secondary'
                onClick={handleCancel}
                sx={{
                  flexGrow: 1,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  borderRadius: '8px',
                  textTransform: 'none',
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={loading}
                size='large'
                variant='contained'
                color='primary'
                onClick={handleSubmit}
                sx={{
                  flexGrow: 1,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  borderRadius: '8px',
                  textTransform: 'none',
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Submit'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
      <AlertMessage message={alertMessage} severity={alertSeverity} onClose={handleCloseAlert} />
    </Container>
  );
}
