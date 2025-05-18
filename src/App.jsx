import { useEffect, useState } from 'react';
import './index.css';

const API_KEY = "8c8e1a50-6322-4135-8875-5d40a5420d86";
const API_URL_POPULAR = "https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=1";
const API_URL_SEARCH = "https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=";
const API_URL_MOVIE_DETAILS = "https://kinopoiskapiunofficial.tech/api/v2.2/films/";
const API_URL_GENRES = "https://kinopoiskapiunofficial.tech/api/v2.2/films/filters";
const API_URL_BY_GENRE = "https://kinopoiskapiunofficial.tech/api/v2.2/films";

const moviesPerPage = 8;

function App() {
  const [allMovies, setAllMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    getMovies(API_URL_POPULAR);
    loadGenres();
  }, []);

  useEffect(() => {
    if (selectedGenre) {
      getMovies(`${API_URL_BY_GENRE}?genres=${selectedGenre}&page=1`);
    } else {
      getMovies(API_URL_POPULAR);
    }
  }, [selectedGenre]);

  const getMovies = async (url) => {
    const resp = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": API_KEY,
      },
    });
    const data = await resp.json();
    const films = data.films || data.items || [];
    setAllMovies(films);
    setCurrentPage(1);
  };

  const loadGenres = async () => {
    const resp = await fetch(API_URL_GENRES, {
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": API_KEY,
      },
    });
    const data = await resp.json();
    setGenres(data.genres || []);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      getMovies(`${API_URL_SEARCH}${searchValue.trim()}`);
      setSearchValue('');
      setSelectedGenre('');
    }
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    const shuffled = [...allMovies].sort(() => 0.5 - Math.random());
    setAllMovies(shuffled.slice(0, 20));
    setCurrentPage(1);
    setSelectedGenre('');
    setSearchValue('');
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
    setSearchValue('');
  };

  const openModal = async (id) => {
    const resp = await fetch(API_URL_MOVIE_DETAILS + id, {
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": API_KEY,
      },
    });
    const data = await resp.json();
    setModalData(data);
    document.body.classList.add("stop-scrolling");
  };

  const closeModal = () => {
    setModalData(null);
    document.body.classList.remove("stop-scrolling");
  };

  const getClassByRate = (vote) => {
    if (vote >= 7) return "green";
    else if (vote > 5) return "orange";
    else return "red";
  };

  const moviesToShow = allMovies.slice((currentPage - 1) * moviesPerPage, currentPage * moviesPerPage);
  const totalPages = Math.ceil(allMovies.length / moviesPerPage);

  return (
    <div>
      <header className="container">
        <div className="header__content">
          <a href="#" className="header__logo" onClick={handleLogoClick}>На главную</a>

          <form onSubmit={handleSearch}>
            <input
              type="text"
              className="header__search"
              placeholder="Поиск"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </form>

          <form className="filter-form">
            <select className="genre__select" value={selectedGenre} onChange={handleGenreChange}>
              <option value="">жанры</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>{genre.genre}</option>
              ))}
            </select>
          </form>
        </div>
      </header>

      <div className="container">
        <div className="movies">
          {moviesToShow.map((movie) => (
            <div className="movie" key={movie.filmId} onClick={() => openModal(movie.filmId)}>
              <div className="movie__cover-inner">
                <img src={movie.posterUrlPreview} className="movie__cover" alt={movie.nameRu} />
                <div className="movie__cover--darkened"></div>
              </div>
              <div className="movie__info">
                <div className="movie__title">{movie.nameRu}</div>
                <div className="movie__category">{movie.genres.map((g) => g.genre).join(', ')}</div>
                {movie.rating && (
                  <div className={`movie__average movie__average--${getClassByRate(movie.rating)}`}>
                    {movie.rating}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`pagination__button ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {modalData && (
        <div className="modal modal--show" onClick={closeModal}>
          <div className="modal__card" onClick={(e) => e.stopPropagation()}>
            <img className="modal__movie-backdrop" src={modalData.posterUrl} alt="" />
            <h2>
              <span className="modal__movie-title">{modalData.nameRu}</span>
              <span className="modal__movie-release-year"> : {modalData.year} год </span>
            </h2>
            <ul className="modal__movie-info">
              <li className="modal__movie-genre">
                Жанр: {modalData.genres.map((el, i) => <span key={i}>{el.genre}{i < modalData.genres.length - 1 ? ', ' : ''}</span>)}
              </li>
              <li>Сайт: <a className="modal__movie-site" href={modalData.webUrl}>{modalData.webUrl}</a></li>
              <li className="modal__movie-overview">Описание: {modalData.description}</li>
            </ul>
            <button type="button" className="modal__button-close" onClick={closeModal}>Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
