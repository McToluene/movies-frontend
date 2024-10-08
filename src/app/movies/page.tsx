'use client';

import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import {
  Grid,
  Typography,
  Button,
  CircularProgress,
  Container,
  Box,
  Pagination,
} from '@mui/material';
import { MoviesContext } from '../state/movieContext';
import Wrapper from './wrapper';
import MovieCard from '@/components/movieCard';

export default function MoviesPage() {
  const { state, dispatch } = useContext(MoviesContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`/api/movies?limit=${limit}&page=${page}`);
        if (response.ok) {
          const responseData = await response.json();
          dispatch({ type: 'SET_MOVIES', payload: responseData });
        } else {
          const { message } = await response.json();
          setError(message);
        }
      } catch (error) {
        setError('Failed to load movies.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [dispatch, page]);

  const handleAddMovie = () => {
    router.push('/movies/add');
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  let content;

  if (loading) {
    content = (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  } else if (error) {
    content = (
      <Box sx={{ textAlign: 'center', marginTop: '20%' }}>
        <Typography variant='h3'>{error}</Typography>
      </Box>
    );
  } else if (state.movies?.length === 0) {
    content = (
      <Box sx={{ textAlign: 'center', marginTop: '20%' }}>
        <Typography variant='h3'>Your movies list is empty.</Typography>
        <Button
          variant='contained'
          color='primary'
          onClick={handleAddMovie}
          size='large'
          sx={{
            mt: 3,
            mb: 2,
            color: '#ffffff',
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: '8px',
          }}
        >
          Add a new movie
        </Button>
      </Box>
    );
  } else {
    content = (
      <Container maxWidth='lg' sx={{ minHeight: '100vh' }}>
        <Grid container spacing={4} sx={{ padding: '20px' }}>
          {state.movies?.map((movie) => (
            <Grid item xs={12} sm={6} md={3} key={movie._id}>
              <MovieCard
                id={movie._id}
                title={movie.title}
                imageUrl={movie.url}
                year={movie.year}
              />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(state.total / limit)}
            page={page}
            onChange={handlePageChange}
            color='primary'
            size='small'
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 0,
              },
            }}
          />
        </Box>
      </Container>
    );
  }

  return <Wrapper title='My Movies'>{content}</Wrapper>;
}
