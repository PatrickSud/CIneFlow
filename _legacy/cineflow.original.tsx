import React, { useState, useEffect, useMemo, useRef } from 'react';

// Base de dados inicial consolidada com os metadados estendidos (Filmes e Séries)
const INITIAL_DATABASE = [
  {
    "id": "tt0033467",
    "titulo": "Citizen Kane",
    "tipo": "movie",
    "ano": 1941,
    "generos": ["Drama", "Mistério"],
    "data_adicao": "2025-07-12T01:06:55.865Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0033467/img",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 5,
    "notas_pessoais": ""
  },
  {
    "id": "tt0068646",
    "titulo": "The Godfather",
    "tipo": "movie",
    "ano": 1972,
    "generos": ["Crime", "Drama"],
    "data_adicao": "2025-11-17T19:37:36.471Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0068646/img",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 5,
    "notas_pessoais": ""
  },
  {
    "id": "tt0080339",
    "titulo": "Airplane!",
    "tipo": "movie",
    "ano": 1980,
    "generos": ["Comédia"],
    "data_adicao": "2026-06-30T16:13:10.845Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0080339/img",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 4,
    "notas_pessoais": ""
  },
  {
    "id": "tt0104257",
    "titulo": "A Few Good Men",
    "tipo": "movie",
    "ano": 1992,
    "generos": ["Drama", "Thriller"],
    "data_adicao": "2025-10-31T16:24:05.805Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0104257/img",
    "status_assistido": "em_andamento",
    "progresso_porcentagem": 2,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0105236",
    "titulo": "Reservoir Dogs",
    "tipo": "movie",
    "ano": 1992,
    "generos": ["Crime", "Thriller"],
    "data_adicao": "2025-07-14T13:46:20.866Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMmMzYjg4NDctYWY0Mi00OGViLWIzMTMtYWNlZGY5ZDJmYjk3XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0108052",
    "titulo": "Schindler's List",
    "tipo": "movie",
    "ano": 1993,
    "generos": ["Biografia", "Drama", "História"],
    "data_adicao": "2024-12-27T00:05:09.742Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0108052/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0111070",
    "titulo": "The Santa Clause",
    "tipo": "movie",
    "ano": 1994,
    "generos": ["Comédia", "Família", "Fantasia"],
    "data_adicao": "2025-11-13T15:59:10.889Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0111070/img",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 3,
    "notas_pessoais": ""
  },
  {
    "id": "tt0112384",
    "titulo": "Apollo 13",
    "tipo": "movie",
    "ano": 1995,
    "generos": ["Aventura", "Drama", "História"],
    "data_adicao": "2025-12-04T19:58:55.645Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0112384/img",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 4,
    "notas_pessoais": ""
  },
  {
    "id": "tt0112641",
    "titulo": "Casino",
    "tipo": "movie",
    "ano": 1995,
    "generos": ["Crime", "Drama"],
    "data_adicao": "2025-12-04T20:02:53.785Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0112641/img",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 5,
    "notas_pessoais": ""
  },
  {
    "id": "tt0115988",
    "titulo": "The Crucible",
    "tipo": "movie",
    "ano": 1996,
    "generos": ["Drama", "História"],
    "data_adicao": "2025-10-31T17:03:10.659Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0115988/img",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 4,
    "notas_pessoais": ""
  },
  {
    "id": "tt0120815",
    "titulo": "Saving Private Ryan",
    "tipo": "movie",
    "ano": 1998,
    "generos": ["Drama", "Guerra"],
    "data_adicao": "2026-01-28T16:19:30.086Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0120815/img",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 5,
    "notas_pessoais": ""
  },
  {
    "id": "tt0120889",
    "titulo": "What Dreams May Come",
    "tipo": "movie",
    "ano": 1998,
    "generos": ["Drama", "Fantasia"],
    "data_adicao": "2025-06-16T18:38:54.932Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BOWVmNzA5NDQtYTNiYy00YjI0LWJjMWItZjEyNmI5YjRlZTI5XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0139654",
    "titulo": "Training Day",
    "tipo": "movie",
    "ano": 2001,
    "generos": ["Ação", "Crime", "Drama"],
    "data_adicao": "2026-01-12T16:01:10.650Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0139654/img",
    "status_assistido": "em_andamento",
    "progresso_porcentagem": 1,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0212720",
    "titulo": "A.I. Artificial Intelligence",
    "tipo": "movie",
    "ano": 2001,
    "generos": ["Sci-Fi", "Drama"],
    "data_adicao": "2024-12-26T23:51:19.904Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BODA1YjhhZDctM2Y1ZS00ODkyLWFmMTAtZGY5YWEzNzRjYzA1XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0245844",
    "titulo": "The Count of Monte Cristo",
    "tipo": "movie",
    "ano": 2002,
    "generos": ["Ação", "Aventura", "Drama"],
    "data_adicao": "2024-12-29T14:37:17.145Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BYjQ3NWUxNDMtNGUyYS00M2E4LThmYjgtZmQ3YTU4ZWZlNTk0XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0265086",
    "titulo": "Black Hawk Down",
    "tipo": "movie",
    "ano": 2001,
    "generos": ["Ação", "Guerra", "Drama"],
    "data_adicao": "2026-05-26T16:12:48.984Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0265086/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0272338",
    "titulo": "Punch-Drunk Love",
    "tipo": "movie",
    "ano": 2002,
    "generos": ["Comédia", "Drama", "Romance"],
    "data_adicao": "2025-09-10T02:18:07.278Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BZTYyMTQ2MDAtMzYzYS00YjZiLWJiNDUtZjEwNzM4YzE1ZDhhXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0293429",
    "titulo": "Mortal Kombat",
    "tipo": "movie",
    "ano": 1995,
    "generos": ["Ação", "Fantasia"],
    "data_adicao": "2026-01-12T15:55:13.197Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0293429/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0332452",
    "titulo": "Troy",
    "tipo": "movie",
    "ano": 2004,
    "generos": ["Drama", "História", "Ação"],
    "data_adicao": "2026-01-17T21:44:00.101Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0332452/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0338013",
    "titulo": "Eternal Sunshine of the Spotless Mind",
    "tipo": "movie",
    "ano": 2004,
    "generos": ["Drama", "Romance", "Sci-Fi"],
    "data_adicao": "2024-12-27T01:03:43.877Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0338013/img",
    "status_assistido": "em_andamento",
    "progresso_porcentagem": 17,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0361748",
    "titulo": "Inglourious Basterds",
    "tipo": "movie",
    "ano": 2009,
    "generos": ["Ação", "Drama", "Guerra"],
    "data_adicao": "2025-07-14T14:00:30.009Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BODZhMWJlNjYtNDExNC00MTIzLTllM2ItOGQ2NGVjNDQ3MzkzXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0397535",
    "titulo": "Memoirs of a Geisha",
    "tipo": "movie",
    "ano": 2005,
    "generos": ["Drama", "Romance"],
    "data_adicao": "2025-04-20T02:02:42.036Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMTYxMzM4NTEzOV5BMl5BanBnXkFtZTcwNDMwNjQzMw@@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0452694",
    "titulo": "The Time Traveler's Wife",
    "tipo": "movie",
    "ano": 2009,
    "generos": ["Drama", "Fantasia", "Romance"],
    "data_adicao": "2025-08-10T23:48:07.497Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BOGU4M2JjNmEtYTVkOS00ZWY5LTllODQtNWExN2U1NzQwZGEwXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0472033",
    "titulo": "9",
    "tipo": "movie",
    "ano": 2009,
    "generos": ["Animação", "Ação", "Aventura"],
    "data_adicao": "2026-03-20T15:13:30.202Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0472033/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0475276",
    "titulo": "United 93",
    "tipo": "movie",
    "ano": 2006,
    "generos": ["Drama", "História", "Thriller"],
    "data_adicao": "2024-12-27T00:04:52.417Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMTI1Nzc3NjAwOF5BMl5BanBnXkFtZTcwNzYzMjYzMQ@@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0825232",
    "titulo": "The Bucket List",
    "tipo": "movie",
    "ano": 2007,
    "generos": ["Aventura", "Comédia", "Drama"],
    "data_adicao": "2026-07-06T13:31:38.305Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0825232/img",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 4,
    "notas_pessoais": ""
  },
  {
    "id": "tt0942385",
    "titulo": "Tropic Thunder",
    "tipo": "movie",
    "ano": 2008,
    "generos": ["Ação", "Comédia"],
    "data_adicao": "2026-06-30T15:41:06.283Z",
    "poster_url": "https://images.metahub.space/poster/small/tt0942385/img",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 4,
    "notas_pessoais": ""
  },
  {
    "id": "tt0970416",
    "titulo": "The Day the Earth Stood Still",
    "tipo": "movie",
    "ano": 2008,
    "generos": ["Drama", "Sci-Fi"],
    "data_adicao": "2025-06-28T17:55:27.226Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMTI5NTg1MzU5Nl5BMl5BanBnXkFtZTcwMDU1ODMwMg@@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt10665342",
    "titulo": "Halloween Ends",
    "tipo": "movie",
    "ano": 2022,
    "generos": ["Terror", "Thriller"],
    "data_adicao": "2024-12-27T00:00:36.246Z",
    "poster_url": "https://images.metahub.space/poster/medium/tt10665342/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt10676052",
    "titulo": "The Fantastic Four: First Steps",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Ação", "Sci-Fi"],
    "data_adicao": "2025-10-08T23:03:36.955Z",
    "poster_url": "https://images.metahub.space/poster/small/tt10676052/img",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 4,
    "notas_pessoais": ""
  },
  {
    "id": "tt10734928",
    "titulo": "The Legend of Hei",
    "tipo": "movie",
    "ano": 2019,
    "generos": ["Animação", "Fantasia"],
    "data_adicao": "2026-04-22T00:05:10.310Z",
    "poster_url": "https://images.metahub.space/poster/small/tt10734928/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt11214558",
    "titulo": "The Smashing Machine",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Drama", "Esporte"],
    "data_adicao": "2025-10-08T23:03:14.187Z",
    "poster_url": "https://images.metahub.space/poster/small/tt11214558/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt11315808",
    "titulo": "Joker: Folie à Deux",
    "tipo": "movie",
    "ano": 2024,
    "generos": ["Drama", "Musical"],
    "data_adicao": "2026-04-09T13:40:39.053Z",
    "poster_url": "https://images.metahub.space/poster/small/tt11315808/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt11378946",
    "titulo": "Michael",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Biografia", "Música"],
    "data_adicao": "2026-07-03T16:22:54.981Z",
    "poster_url": "https://images.metahub.space/poster/small/tt11378946/img",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 5,
    "notas_pessoais": ""
  },
  {
    "id": "tt12042730",
    "titulo": "Project Hail Mary",
    "tipo": "movie",
    "ano": 2026,
    "generos": ["Sci-Fi", "Aventura"],
    "data_adicao": "2026-04-12T01:42:26.488Z",
    "poster_url": "https://images.metahub.space/poster/small/tt12042730/img",
    "status_assistido": "em_andamento",
    "progresso_porcentagem": 1,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt1288558",
    "titulo": "Evil Dead",
    "tipo": "movie",
    "ano": 2013,
    "generos": ["Terror"],
    "data_adicao": "2025-09-06T01:10:44.312Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BYjkwODM5ZWUtMjI2Ni00Y2RiLWJkNDYtZWQ2ZTRhMjI1N2FmXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt13186482",
    "titulo": "Mufasa: The Lion King",
    "tipo": "movie",
    "ano": 2024,
    "generos": ["Aventura", "Família"],
    "data_adicao": "2026-04-12T21:12:20.059Z",
    "poster_url": "https://images.metahub.space/poster/small/tt13186482/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt13238346",
    "titulo": "Past Lives",
    "tipo": "movie",
    "ano": 2023,
    "generos": ["Drama", "Romance"],
    "data_adicao": "2025-06-16T18:41:19.735Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BYjQyMTNhNjUtN2VmYy00NWRhLTkwOTctMGVmNTBmNDIxYjZhXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt13345606",
    "titulo": "Evil Dead Rise",
    "tipo": "movie",
    "ano": 2023,
    "generos": ["Terror"],
    "data_adicao": "2025-09-06T01:10:36.751Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMjM1ZmViMmYtOGYzZC00YzhmLWE0MTMtMzNjYzcyNjEwYWRkXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt14205554",
    "titulo": "KPop Demon Hunters",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Animação", "Ação", "Musical"],
    "data_adicao": "2025-08-10T15:32:50.798Z",
    "poster_url": "https://images.metahub.space/poster/small/tt14205554/img",
    "status_assistido": "em_andamento",
    "progresso_porcentagem": 51,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt14230388",
    "titulo": "Asteroid City",
    "tipo": "movie",
    "ano": 2023,
    "generos": ["Comédia", "Drama"],
    "data_adicao": "2024-12-27T01:04:29.647Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BZjY2YjYxNjEtNDJkYi00ZmJjLWIwYTEtNjEyZDgzY2M5ZDc3XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt14403504",
    "titulo": "Last Breath",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Thriller", "Drama"],
    "data_adicao": "2025-06-12T15:32:07.588Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BYmNjMDg1Y2EtNmZiOS00NGUzLThjZGYtNzU2OGI5M2VkMDFhXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt14850054",
    "titulo": "Greenland 2: Migration",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Ação", "Sci-Fi"],
    "data_adicao": "2026-06-07T23:45:45.566Z",
    "poster_url": "https://images.metahub.space/poster/small/tt14850054/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt14856980",
    "titulo": "Atlas",
    "tipo": "movie",
    "ano": 2024,
    "generos": ["Ação", "Sci-Fi"],
    "data_adicao": "2024-12-26T23:58:17.049Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BNDUwNTFkNzYtMGM5NS00NTc4LWEwMDUtMmE5MzgyMjcwOWM4XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt1485796",
    "titulo": "The Greatest Showman",
    "tipo": "movie",
    "ano": 2017,
    "generos": ["Biografia", "Drama", "Musical"],
    "data_adicao": "2025-09-27T21:17:39.724Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMjI1NDYzNzY2Ml5BMl5BanBnXkFtZTgwODQwODczNTM@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt14905854",
    "titulo": "Hamnet",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Drama", "Histórico"],
    "data_adicao": "2026-06-02T16:05:00.230Z",
    "poster_url": "https://images.metahub.space/poster/small/tt14905854/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt14961624",
    "titulo": "The Old Guard 2",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Ação", "Fantasia"],
    "data_adicao": "2025-07-01T00:09:19.256Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BZmFhNWY1MjEtZTkyZS00ZWIzLTk4ZWItMDM0MzliNmE1ZGZhXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt14966898",
    "titulo": "Late Night with the Devil",
    "tipo": "movie",
    "ano": 2023,
    "generos": ["Terror"],
    "data_adicao": "2025-01-09T19:31:51.917Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BYtriNWZlNGMtOTUwZi00ZjE4LWE1ZjEtNWE4MGQ2ZGU5NDliXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt15047880",
    "titulo": "Disclosure Day",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Sci-Fi", "Drama"],
    "data_adicao": "2026-06-22T13:18:57.479Z",
    "poster_url": "https://images.metahub.space/poster/small/tt15047880/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt1517268",
    "titulo": "Barbie",
    "tipo": "movie",
    "ano": 2023,
    "generos": ["Comédia", "Fantasia"],
    "data_adicao": "2024-12-27T01:06:45.212Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BYjI3NDU0ZGYtYjA2YS00Y2RlLTgwZDAtYTE2YTM5ZjE1M2JlXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt16366836",
    "titulo": "Venom: The Last Dance",
    "tipo": "movie",
    "ano": 2024,
    "generos": ["Ação", "Sci-Fi"],
    "data_adicao": "2024-12-26T23:49:43.895Z",
    "poster_url": "https://images.metahub.space/poster/medium/tt16366836/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt1684562",
    "titulo": "The Fall Guy",
    "tipo": "movie",
    "ano": 2024,
    "generos": ["Ação", "Comédia"],
    "data_adicao": "2024-12-27T00:02:15.671Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BM2U0MTJiYTItMjNiZS00MzU4LTkxYTAtYTU0ZGY1ODJhMjRhXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt1772264",
    "titulo": "Stonehearst Asylum",
    "tipo": "movie",
    "ano": 2014,
    "generos": ["Drama", "Mistério", "Thriller"],
    "data_adicao": "2026-05-09T13:04:59.243Z",
    "poster_url": "https://images.metahub.space/poster/small/tt1772264/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt1856101",
    "titulo": "Blade Runner 2049",
    "tipo": "movie",
    "ano": 2017,
    "generos": ["Sci-Fi", "Drama"],
    "data_adicao": "2026-02-02T00:45:18.496Z",
    "poster_url": "https://images.metahub.space/poster/small/tt1856101/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt18925334",
    "titulo": "Pearl",
    "tipo": "movie",
    "ano": 2022,
    "generos": ["Terror", "Drama"],
    "data_adicao": "2025-11-20T02:55:33.812Z",
    "poster_url": "https://images.metahub.space/poster/small/tt18925334/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt1896747",
    "titulo": "Fly Me to the Moon",
    "tipo": "movie",
    "ano": 2024,
    "generos": ["Romance", "Comédia"],
    "data_adicao": "2024-12-26T23:55:58.685Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BYzI4MzRlMGYtYWUwMC00M2FkLTliN2ItNDA1MDJhOTgwMzY5XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt19861162",
    "titulo": "The Return",
    "tipo": "movie",
    "ano": 2024,
    "generos": ["Drama", "História"],
    "data_adicao": "2025-09-09T20:18:28.247Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMDNlNzQ5NDAtYTdlZC00YTRiLTg0ZWUtMmY5NWYyNzdiYTYyXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt20215234",
    "titulo": "Conclave",
    "tipo": "movie",
    "ano": 2024,
    "generos": ["Thriller"],
    "data_adicao": "2025-03-03T03:21:32.858Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BYjgxMDI5NmMtNTU3OS00ZDQxLTgxZmEtNzY1ZTBmMDY4NDRkXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt20969586",
    "titulo": "Thunderbolts*",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Ação", "Aventura"],
    "data_adicao": "2025-08-10T15:33:09.773Z",
    "poster_url": "https://images.metahub.space/poster/medium/tt20969586/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt21191806",
    "titulo": "Back in Action",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Ação", "Comédia"],
    "data_adicao": "2025-01-14T20:00:19.357Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMWQ4YWYxYTAtZTlhNC00Nzc3LWE3OWUtZjY5MThlNWNiYTBiXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt2140479",
    "titulo": "The Accountant",
    "tipo": "movie",
    "ano": 2016,
    "generos": ["Ação", "Drama", "Thriller"],
    "data_adicao": "2025-04-04T00:38:40.039Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BNDc5Mzg2NTYxNV5BMl5BanBnXkFtZTgwMjQ2ODAwOTE@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt21823606",
    "titulo": "A Real Pain",
    "tipo": "movie",
    "ano": 2024,
    "generos": ["Comédia", "Drama"],
    "data_adicao": "2025-03-24T01:22:24.574Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BODY2YWYwM2YtZTVlNC00MjgyLTgzYTgtNmFmYWE5ZmY1MDM5XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt22898462",
    "titulo": "The Conjuring: Last Rites",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Terror", "Mistério"],
    "data_adicao": "2025-10-08T23:03:29.768Z",
    "poster_url": "https://images.metahub.space/poster/small/tt22898462/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt26342662",
    "titulo": "M3GAN 2.0",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Terror", "Sci-Fi"],
    "data_adicao": "2026-06-04T20:16:31.477Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMzFmNjVjZWQtZjI5Zi00YThiLTg0ZWItZDdjYzhhZDE1NTE2XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt26720001",
    "titulo": "Stitch Head",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Animação", "Aventura"],
    "data_adicao": "2025-12-12T15:25:08.157Z",
    "poster_url": "https://images.metahub.space/poster/small/tt26720001/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt27052633",
    "titulo": "Echo Valley",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Drama", "Thriller"],
    "data_adicao": "2025-06-12T15:31:01.040Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BN2RmMTUzY2YtYTBlZC00OTVhLWE0YTEtMmU3OGY5YWM2NjhhXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt2766804",
    "titulo": "Lady Bug",
    "tipo": "movie",
    "ano": 2024,
    "generos": ["Mistério", "Drama"],
    "data_adicao": "2024-12-27T01:07:29.701Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BOTY4NzQ4MTQzMl5BMl5BanBnXkFtZTgwOTA0NzM2NDE@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt27714581",
    "titulo": "Sentimental Value",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Drama", "Comédia"],
    "data_adicao": "2026-03-16T02:22:18.422Z",
    "poster_url": "https://images.metahub.space/poster/small/tt27714581/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt27847051",
    "titulo": "The Secret Agent",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Ação", "Crime"],
    "data_adicao": "2026-01-12T16:21:09.726Z",
    "poster_url": "https://images.metahub.space/poster/small/tt27847051/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt2788710",
    "titulo": "The Interview",
    "tipo": "movie",
    "ano": 2014,
    "generos": ["Comédia"],
    "data_adicao": "2025-12-30T16:50:25.339Z",
    "poster_url": "https://images.metahub.space/poster/small/tt2788710/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt28607951",
    "titulo": "Anora",
    "tipo": "movie",
    "ano": 2024,
    "generos": ["Comédia", "Drama", "Romance"],
    "data_adicao": "2025-03-03T01:42:04.605Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BYThiN2M0NTItODRmNC00NDhlLWFiYTgtMWM2YTEyYzI3ZTY1XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt28996126",
    "titulo": "Nobody 2",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Ação", "Thriller"],
    "data_adicao": "2025-09-19T00:50:04.782Z",
    "poster_url": "https://images.metahub.space/poster/small/tt28996126/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt2910814",
    "titulo": "The Signal",
    "tipo": "movie",
    "ano": 2014,
    "generos": ["Sci-Fi", "Thriller"],
    "data_adicao": "2025-05-16T17:28:46.780Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMDEwYjVkZGItMjc3Zi00YjI5LWE0YTUtODQ4NzRiM2FmYmNmXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt29268110",
    "titulo": "Smile 2",
    "tipo": "movie",
    "ano": 2024,
    "generos": ["Terror", "Mistério"],
    "data_adicao": "2025-08-04T16:28:07.932Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BYTg5OTMyMGMtYzMwNC00NDMyLWE0OGUtMTQ1ODcwM2FjOTM4XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt29552248",
    "titulo": "Swapped",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Comédia"],
    "data_adicao": "2026-05-25T13:25:06.468Z",
    "poster_url": "https://images.metahub.space/poster/small/tt29552248/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt30144839",
    "titulo": "One Battle After Another",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Ação", "Drama"],
    "data_adicao": "2026-01-09T15:42:44.182Z",
    "poster_url": "https://images.metahub.space/poster/small/tt30144839/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt3045628",
    "titulo": "Holland",
    "tipo": "movie",
    "ano": 2024,
    "generos": ["Drama"],
    "data_adicao": "2025-03-24T01:21:32.241Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMTJjZmE4Y2UtYzQ5OS00N2Y2LWEzYjEtNzhiMjA3YTlkMjdjXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt30825738",
    "titulo": "Star Wars: The Mandalorian and Grogu",
    "tipo": "movie",
    "ano": 2026,
    "generos": ["Sci-Fi", "Ação"],
    "data_adicao": "2026-07-03T16:23:08.113Z",
    "poster_url": "https://images.metahub.space/poster/small/tt30825738/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt30955489",
    "titulo": "Until Dawn",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Terror", "Thriller"],
    "data_adicao": "2025-07-20T02:22:56.129Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BZWU4NDY0ODktOGI3OC00NWE1LWIwYmQtNmJiZWU3NmZlMDhkXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt31193180",
    "titulo": "Sinners",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Drama", "Terror"],
    "data_adicao": "2025-05-09T00:32:18.891Z",
    "poster_url": "https://images.metahub.space/poster/small/tt31193180/img",
    "status_assistido": "em_andamento",
    "progresso_porcentagem": 3,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt31227572",
    "titulo": "Predator: Badlands",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Ação", "Sci-Fi"],
    "data_adicao": "2025-11-10T00:06:41.195Z",
    "poster_url": "https://images.metahub.space/poster/small/tt31227572/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt31433402",
    "titulo": "Fear Street: Prom Queen",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Terror"],
    "data_adicao": "2025-05-19T00:06:59.189Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BODk1MmRkNWMtNDI0YS00NDI3LWIwYjktNzg2ZTNkYzA1MGE1XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt31511689",
    "titulo": "Vicious",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Thriller", "Terror"],
    "data_adicao": "2026-07-06T01:33:29.156Z",
    "poster_url": "https://images.metahub.space/poster/small/tt31511689/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt32141377",
    "titulo": "28 Years Later: The Bone Temple",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Terror", "Sci-Fi"],
    "data_adicao": "2026-03-09T14:12:07.925Z",
    "poster_url": "https://images.metahub.space/poster/small/tt32141377/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt32194932",
    "titulo": "The Ritual",
    "tipo": "movie",
    "ano": 2017,
    "generos": ["Terror", "Mistério"],
    "data_adicao": "2025-07-04T15:13:50.899Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BYjc5ZTA4ZjUtOTY2ZS00MjA0LTkxNGUtNDc1ZDVlOTU2ZGQ2XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt32246771",
    "titulo": "Bring Her Back",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Thriller", "Terror"],
    "data_adicao": "2025-10-24T16:32:38.707Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BZTlhYTk1ZTEtOWY3NC00NWQ5LTlkOTctNjQ3ZDYyZGE5ZWNlXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt3281548",
    "titulo": "Little Women",
    "tipo": "movie",
    "ano": 2019,
    "generos": ["Drama", "Romance"],
    "data_adicao": "2024-12-27T01:06:56.418Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMwmzYjNiZWMtMDg4NS00MDgyLTk5MWItOTFmNjg4NzRhZmExXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt32820897",
    "titulo": "Demon Slayer: Kimetsu no Yaiba Infinity Castle",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Animação", "Ação", "Fantasia"],
    "data_adicao": "2025-09-09T20:18:56.567Z",
    "poster_url": "https://images.metahub.space/poster/small/tt32820897/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt32985279",
    "titulo": "Steve",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Drama", "Biografia"],
    "data_adicao": "2025-10-01T10:58:06.537Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BYmE4N2ZlNWQtMDRhNC00ZmYzLWI5ODMtODAzZjRiOTkxZGZhXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt3315342",
    "titulo": "Logan",
    "tipo": "movie",
    "ano": 2017,
    "generos": ["Ação", "Sci-Fi", "Drama"],
    "data_adicao": "2025-08-05T21:03:24.410Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BM2JjODdkMGMtNmY2YS00OGM2LThiY2YtZGYyNzE4Nzc2ODA0XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt3397884",
    "titulo": "Sicario",
    "tipo": "movie",
    "ano": 2015,
    "generos": ["Ação", "Crime", "Drama"],
    "data_adicao": "2025-07-15T15:36:13.287Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMjA5NjM3NTk1M15BMl5BanBnXkFtZTgwMzg1MzU2NjE@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt3783958",
    "titulo": "La La Land",
    "tipo": "movie",
    "ano": 2016,
    "generos": ["Comédia", "Drama", "Musical"],
    "data_adicao": "2025-07-12T20:18:47.223Z",
    "poster_url": "https://images.metahub.space/poster/small/tt3783958/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt4216984",
    "titulo": "Wolf Man",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Terror", "Drama"],
    "data_adicao": "2025-05-21T14:53:15.845Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BYmFkYTNhMWUtMjEyNy00MWE0LWJlYTQtMWFmNDUwNmFjMzAxXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt4695012",
    "titulo": "It Comes at Night",
    "tipo": "movie",
    "ano": 2017,
    "generos": ["Mistério", "Terror"],
    "data_adicao": "2024-12-27T01:05:17.479Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMjQ3MDA0ODA2N15BMl5BanBnXkFtZTgwNzg0NzgwMjI@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt4975722",
    "titulo": "Moonlight",
    "tipo": "movie",
    "ano": 2016,
    "generos": ["Drama"],
    "data_adicao": "2025-08-05T14:33:48.684Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BNzQxNTIyODAxMV5BMl5BanBnXkFtZTgwNzQyMDA3OTE@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt5074352",
    "titulo": "Dangal",
    "tipo": "movie",
    "ano": 2016,
    "generos": ["Biografia", "Ação", "Drama"],
    "data_adicao": "2024-12-27T00:05:46.411Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMTQ4MzQzMzM2Nl5BMl5BanBnXkFtZTgwMTQ1NzU3MDI@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt5181260",
    "titulo": "The Unbreakable Boy",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Drama", "Família"],
    "data_adicao": "2025-07-06T22:25:09.210Z",
    "poster_url": "https://images.metahub.space/poster/medium/tt5181260/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt5727208",
    "titulo": "Uncut Gems",
    "tipo": "movie",
    "ano": 2019,
    "generos": ["Crime", "Thriller"],
    "data_adicao": "2025-09-10T02:18:21.131Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BNmI0YjA5NjItYzExYi00NzkxLTkxNDctNGJjYTZhM2M0NDQ0XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt7181546",
    "titulo": "From the World of John Wick: Ballerina",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Ação", "Thriller"],
    "data_adicao": "2025-06-04T20:05:49.221Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BNzdhZmY2OTQtYWI4OC00ZtxlLTgzYjAtNGU1NmM4YzkwYWMxXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt7451284",
    "titulo": "Batman Ninja",
    "tipo": "movie",
    "ano": 2018,
    "generos": ["Animação", "Ação"],
    "data_adicao": "2025-07-18T21:56:00.439Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BNjdhMGVhMjEtNzgyZC00ZGNiLWFkN2QtNjdmNTg2MzVjOTMwXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt7605074",
    "titulo": "The Wandering Earth",
    "tipo": "movie",
    "ano": 2019,
    "generos": ["Sci-Fi", "Ação"],
    "data_adicao": "2025-06-04T20:06:09.046Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BM2RkYTg4YWQtNmE3Ny00MmE3LWJkNzQtZTFhNWNjOGM3OTZlXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt7737800",
    "titulo": "Woman of the Hour",
    "tipo": "movie",
    "ano": 2023,
    "generos": ["Drama", "Thriller"],
    "data_adicao": "2025-01-09T19:32:35.532Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BYzliNzRjNDMtYTFmOS00NDQxLWJlOWMtZTViNjcyMzc0NzQwXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt7766378",
    "titulo": "The Electric State",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Sci-Fi", "Aventura"],
    "data_adicao": "2025-03-10T12:10:09.706Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMjQ1MTYzZmItMTkzYy00NzdmLTlhYmMtMzk5YjhiOThmZDgwXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt8999762",
    "titulo": "The Brutalist",
    "tipo": "movie",
    "ano": 2024,
    "generos": ["Drama"],
    "data_adicao": "2025-01-06T03:58:09.692Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMWE5OGU0OWQtYjdiOC00NWNmLWI3ZTQtZGJlYmQ1ODEyODA1XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt9218128",
    "titulo": "Gladiator II",
    "tipo": "movie",
    "ano": 2024,
    "generos": ["Ação", "Drama"],
    "data_adicao": "2024-12-26T23:49:52.494Z",
    "poster_url": "https://images.metahub.space/poster/medium/tt9218128/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt9243804",
    "titulo": "The Green Knight",
    "tipo": "movie",
    "ano": 2021,
    "generos": ["Fantasia", "Drama"],
    "data_adicao": "2024-12-27T01:00:54.522Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BNjRjNmU1M2ItNDU4Ni00ZGY2LTlmNzItY2MxYmY3OTllZjMwXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt31036941",
    "titulo": "Jurassic World: Rebirth",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Ação", "Sci-Fi"],
    "data_adicao": "2025-10-08T23:03:36.955Z",
    "poster_url": "https://images.metahub.space/poster/small/tt31036941/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt21103218",
    "titulo": "The Lost Bus",
    "tipo": "movie",
    "ano": 2025,
    "generos": ["Drama"],
    "data_adicao": "2025-10-01T10:56:34.817Z",
    "poster_url": "https://images.metahub.space/poster/small/tt21103218/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  // --- SÉRIES E ANIMES ---
  {
    "id": "tt0118414",
    "titulo": "The Odyssey",
    "tipo": "series",
    "ano": 1997,
    "generos": ["Aventura", "Fantasia"],
    "temporadas_assistidas_max": 1,
    "data_adicao": "2025-09-10T19:20:25.275Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BN2M2MTkwNTEtZTU1Mi00YmVmLTg4YjgtOTM5MTk4Y2Q5OTgwXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0141842",
    "titulo": "The Sopranos",
    "tipo": "series",
    "ano": 1999,
    "generos": ["Crime", "Drama"],
    "temporadas_assistidas_max": 6,
    "data_adicao": "2024-12-27T01:00:36.402Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMjRmMTNiMTQtMDg1ZS00MGM1LWE1MGUtYjEzMGFjNWUzOWRkXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 5,
    "notas_pessoais": ""
  },
  {
    "id": "tt0386676",
    "titulo": "The Office",
    "tipo": "series",
    "ano": 2005,
    "generos": ["Comédia"],
    "temporadas_assistidas_max": 9,
    "data_adicao": "2024-12-26T23:59:24.270Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BZjQwYzBlYzUtZjhhOS00ZDQ0LWE0NzAtYTk4MjgzZTNkZWEzXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 5,
    "notas_pessoais": ""
  },
  {
    "id": "tt0389663",
    "titulo": "Mythos",
    "tipo": "series",
    "ano": 2010,
    "generos": ["Documentário"],
    "temporadas_assistidas_max": 1,
    "data_adicao": "2024-12-27T00:01:09.615Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMjk4ODczNjkwOV5BMl5BanBnXkFtZTcwMDk4MzM2MQ@@._V1_SX250.jpg",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt0944947",
    "titulo": "Game of Thrones",
    "tipo": "series",
    "ano": 2011,
    "generos": ["Drama", "Fantasia"],
    "temporadas_assistidas_max": 8,
    "data_adicao": "2024-12-27T01:01:17.589Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMTNhMDJmNmYtNDQ5OS00ODdlLWE0ZDAtZTgyYTIwNDY3OTU3XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 5,
    "notas_pessoais": ""
  },
  {
    "id": "tt10311932",
    "titulo": "Someone Has to Die",
    "tipo": "series",
    "ano": 2020,
    "generos": ["Drama", "Suspense"],
    "temporadas_assistidas_max": 0,
    "data_adicao": "2025-07-03T12:50:34.963Z",
    "poster_url": "https://images.metahub.space/poster/small/tt10311932/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt11016042",
    "titulo": "Ripley",
    "tipo": "series",
    "ano": 2024,
    "generos": ["Crime", "Drama", "Mistério"],
    "temporadas_assistidas_max": 1,
    "data_adicao": "2024-12-27T01:10:21.604Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMmI0NzgyY2ItODVmMy00YzQzLWI3ODAtMzExZDMxYWU0YmZhXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt11198330",
    "titulo": "House of the Dragon",
    "tipo": "series",
    "ano": 2022,
    "generos": ["Drama", "Fantasia"],
    "temporadas_assistidas_max": 2,
    "data_adicao": "2024-12-26T23:57:59.488Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BM2QzMGVkNjUtN2Y4Yi00ODMwLTg3YzktYzUxYjJlNjFjNDY1XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt11815682",
    "titulo": "Hacks",
    "tipo": "series",
    "ano": 2021,
    "generos": ["Comédia"],
    "temporadas_assistidas_max": 3,
    "data_adicao": "2025-01-06T03:29:20.951Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BNzRiNGRkZDgtMzkzMS00ZWQ1LWE0MmQtOTZhNTFhNzI1ZmQ3XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt12637874",
    "titulo": "Fallout",
    "tipo": "series",
    "ano": 2024,
    "generos": ["Sci-Fi", "Ação", "Aventura"],
    "temporadas_assistidas_max": 1,
    "data_adicao": "2026-01-09T16:00:16.663Z",
    "poster_url": "https://images.metahub.space/poster/small/tt12637874/img",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt13064902",
    "titulo": "FUBAR",
    "tipo": "series",
    "ano": 2023,
    "generos": ["Ação", "Aventura", "Comédia"],
    "temporadas_assistidas_max": 0,
    "data_adicao": "2025-06-12T15:35:45.135Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BNDUwNTFkNzYtMGM5NS00NTc4LWEwMDUtMmE5MzgyMjcwOWM4XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt13146488",
    "titulo": "Peacemaker",
    "tipo": "series",
    "ano": 2022,
    "generos": ["Ação", "Sci-Fi", "Comédia"],
    "temporadas_assistidas_max": 0,
    "data_adicao": "2025-07-28T21:24:43.212Z",
    "poster_url": "https://images.metahub.space/poster/small/tt13146488/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt13406094",
    "titulo": "The White Lotus",
    "tipo": "series",
    "ano": 2021,
    "generos": ["Comédia", "Drama"],
    "temporadas_assistidas_max": 2,
    "data_adicao": "2026-01-09T15:59:08.096Z",
    "poster_url": "https://images.metahub.space/poster/small/tt13406094/img",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt13968252",
    "titulo": "Eyes of Wakanda",
    "tipo": "series",
    "ano": 2025,
    "generos": ["Animação", "Ação", "Aventura"],
    "temporadas_assistidas_max": 0,
    "data_adicao": "2025-08-07T15:45:10.754Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BZjhhOTE5ODgtNDFjOS00ZTdlLTgzYjAtNGU1NmM4YzkwYWMxXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt14261112",
    "titulo": "Twisted Metal",
    "tipo": "series",
    "ano": 2023,
    "generos": ["Ação", "Comédia", "Sci-Fi"],
    "temporadas_assistidas_max": 0,
    "data_adicao": "2025-08-11T20:46:51.915Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BNDA1NDVjNGMtZjFiZS00YjNiLWEwNTUtNTcyMGIxMTE1ZGY3XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt17677860",
    "titulo": "Presumed Innocent",
    "tipo": "series",
    "ano": 2024,
    "generos": ["Drama", "Mistério"],
    "temporadas_assistidas_max": 1,
    "data_adicao": "2024-12-27T17:12:21.006Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BNDk1MWM3NmItZmNjZS00ZmZkLTk1ZDAtZjFiN2FiZjczNmZhXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt19231492",
    "titulo": "Dark Matter",
    "tipo": "series",
    "ano": 2024,
    "generos": ["Sci-Fi", "Suspense"],
    "temporadas_assistidas_max": 0,
    "data_adicao": "2025-10-24T21:35:29.119Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BNzNmMDBhYmUtN2NmMC00NjNkLWJjMjAtOWJkY2E2YWMzZDJkXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt19854762",
    "titulo": "Hijack",
    "tipo": "series",
    "ano": 2023,
    "generos": ["Drama", "Thriller"],
    "temporadas_assistidas_max": 0,
    "data_adicao": "2026-03-09T14:12:25.384Z",
    "poster_url": "https://images.metahub.space/poster/small/tt19854762/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt2085059",
    "titulo": "Black Mirror",
    "tipo": "series",
    "ano": 2011,
    "generos": ["Sci-Fi", "Drama"],
    "temporadas_assistidas_max": 6,
    "data_adicao": "2025-04-28T11:30:18.711Z",
    "poster_url": "https://images.metahub.space/poster/small/tt2085059/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt22202452",
    "titulo": "Pluribus",
    "tipo": "series",
    "ano": 2025,
    "generos": ["Drama", "Ficção"],
    "temporadas_assistidas_max": 0,
    "data_adicao": "2025-12-17T15:04:24.762Z",
    "poster_url": "https://images.metahub.space/poster/small/tt22202452/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt22249034",
    "titulo": "Rurouni Kenshin",
    "tipo": "series",
    "ano": 2023,
    "generos": ["Animação", "Ação", "Drama"],
    "temporadas_assistidas_max": 0,
    "data_adicao": "2025-02-03T14:21:06.427Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BNDU5YzQwNTktZjg2YS00MWRmLWIzNDEtZjgxMGYwNzQzMjYxXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt23649128",
    "titulo": "The Studio",
    "tipo": "series",
    "ano": 2025,
    "generos": ["Comédia", "Drama"],
    "temporadas_assistidas_max": 0,
    "data_adicao": "2025-08-05T14:44:59.154Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMDQxMWI5OTMtNGRkMC00NTVlLWI5ZjAtZmFiMjMwM2M0N2E0XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt2467372",
    "titulo": "Brooklyn Nine-Nine",
    "tipo": "series",
    "ano": 2013,
    "generos": ["Comédia", "Crime"],
    "temporadas_assistidas_max": 8,
    "data_adicao": "2024-12-29T11:45:35.818Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BNzBiODQxZTUtNjc0MC00Yzc1LThmYTMtN2YwYTU3NjgxMmI4XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt2531336",
    "titulo": "Lupin",
    "tipo": "series",
    "ano": 2021,
    "generos": ["Ação", "Crime", "Drama"],
    "temporadas_assistidas_max": 3,
    "data_adicao": "2024-12-27T00:03:24.171Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMDJhODQ3ZDEtN2JmMS00Yjk5LTk1ZTUtMzI3YTU0NTNjMjAyXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt26687196",
    "titulo": "Waco: American Apocalypse",
    "tipo": "series",
    "ano": 2023,
    "generos": ["Documentário", "Crime"],
    "temporadas_assistidas_max": 1,
    "data_adicao": "2024-12-27T01:07:51.090Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BZDQ2YWNmN2ItOTZkMy00MzU3LThlYmEtNGI5NjFmNDhiZDZjXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt27497448",
    "titulo": "A Knight of the Seven Kingdoms",
    "tipo": "series",
    "ano": 2025,
    "generos": ["Drama", "Aventura"],
    "temporadas_assistidas_max": 0,
    "data_adicao": "2026-06-26T16:17:59.920Z",
    "poster_url": "https://images.metahub.space/poster/small/tt27497448/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt30317229",
    "titulo": "La Palma",
    "tipo": "series",
    "ano": 2024,
    "generos": ["Suspense", "Drama"],
    "temporadas_assistidas_max": 1,
    "data_adicao": "2024-12-26T23:50:21.302Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BZDRkMmNjZTYtOTY1Mi00YWZkLTgxYzctNWZkOTk3Nzk5YjBjXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt30444310",
    "titulo": "Murderbot",
    "tipo": "series",
    "ano": 2025,
    "generos": ["Sci-Fi", "Ação"],
    "temporadas_assistidas_max": 1,
    "data_adicao": "2025-05-13T00:41:00.052Z",
    "poster_url": "https://images.metahub.space/poster/small/tt30444310/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt30460310",
    "titulo": "Spider-Noir",
    "tipo": "series",
    "ano": 2025,
    "generos": ["Ação", "Crime", "Fantasia"],
    "temporadas_assistidas_max": 0,
    "data_adicao": "2026-06-01T13:13:45.623Z",
    "poster_url": "https://images.metahub.space/poster/small/tt30460310/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt31938062",
    "titulo": "The Pitt",
    "tipo": "series",
    "ano": 2025,
    "generos": ["Drama", "Médico"],
    "temporadas_assistidas_max": 0,
    "data_adicao": "2025-09-18T02:19:50.084Z",
    "poster_url": "https://images.metahub.space/poster/small/tt31938062/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt32237534",
    "titulo": "Last Samurai Standing",
    "tipo": "series",
    "ano": 2025,
    "generos": ["Ação", "História"],
    "temporadas_assistidas_max": 0,
    "data_adicao": "2025-11-24T15:54:50.774Z",
    "poster_url": "https://live.metahub.space/poster/small/tt32237534/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt3581932",
    "titulo": "And Then There Were None",
    "tipo": "series",
    "ano": 2015,
    "generos": ["Crime", "Mistério", "Drama"],
    "temporadas_assistidas_max": 1,
    "data_adicao": "2025-11-24T10:19:47.795Z",
    "poster_url": "https://images.metahub.space/poster/small/tt3581932/img",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt4786824",
    "titulo": "The Crown",
    "tipo": "series",
    "ano": 2016,
    "generos": ["Drama", "Biografia", "História"],
    "temporadas_assistidas_max": 6,
    "data_adicao": "2024-12-27T00:10:50.091Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BODcyODZlZDMtZGE0Ni00NjBhLWJlYTAtZDdlNWY3MzkwMGVhXkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt5153902",
    "titulo": "Animated Stories from the New Testament",
    "tipo": "series",
    "ano": 1987,
    "generos": ["Animação", "Família"],
    "temporadas_assistidas_max": 1,
    "data_adicao": "2025-07-24T15:03:14.186Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BOGQ5YWUwNjQtODlmMy00OGUyLTg0YmMtODM4Y2FhODc2ZmQ4XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt5622316",
    "titulo": "The Chosen",
    "tipo": "series",
    "ano": 2019,
    "generos": ["Histórico", "Drama"],
    "temporadas_assistidas_max": 4,
    "data_adicao": "2025-08-25T15:28:02.807Z",
    "poster_url": "https://images.metahub.space/poster/small/tt5622316/img",
    "status_assistido": "em_andamento",
    "progresso_porcentagem": 40,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt5687612",
    "titulo": "Fleabag",
    "tipo": "series",
    "ano": 2016,
    "generos": ["Comédia", "Drama"],
    "temporadas_assistidas_max": 2,
    "data_adicao": "2024-12-27T01:05:01.194Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMjA4MzU5NzQxNV5BMl5BanBnXkFtZTgwOTg3MDA5NzM@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt6156584",
    "titulo": "Snowpiercer",
    "tipo": "series",
    "ano": 2020,
    "generos": ["Ação", "Drama", "Sci-Fi"],
    "temporadas_assistidas_max": 4,
    "data_adicao": "2024-12-26T23:57:32.529Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BMmM1ODg0MjktY2U3ZC00ZDc4LTkxMjAtMzljY2VkZmI3MmE5XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt9253284",
    "titulo": "Andor",
    "tipo": "series",
    "ano": 2022,
    "generos": ["Sci-Fi", "Ação", "Aventura"],
    "temporadas_assistidas_max": 2,
    "data_adicao": "2025-04-22T12:56:57.757Z",
    "poster_url": "https://m.media-amazon.com/images/M/MV5BNGI2MTJjMjUtMTJhOC00YTY2LTg1NjUtMTdmMjg4YTk2YjM5XkEyXkFqcGc@._V1_SX250.jpg",
    "status_assistido": "nao_assistido",
    "progresso_porcentagem": 0,
    "nota": 0,
    "notas_pessoais": ""
  },
  {
    "id": "tt9813792",
    "titulo": "From",
    "tipo": "series",
    "ano": 2022,
    "generos": ["Terror", "Mistério", "Drama"],
    "temporadas_assistidas_max": 3,
    "data_adicao": "2025-03-26T01:15:02.907Z",
    "poster_url": "https://images.metahub.space/poster/small/tt9813792/img",
    "status_assistido": "assistido",
    "progresso_porcentagem": 100,
    "nota": 5,
    "notas_pessoais": ""
  }
];

const POSTER_FALLBACK = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='150' viewBox='0 0 100 150'><rect width='100' height='150' fill='%231e293b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2364748b' font-size='10' font-family='sans-serif'>Sem Imagem</text></svg>";

export default function App() {
  const fileInputRef = useRef(null);

  // --- Estado da Aplicação ---
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('cineflow_extended_db_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao carregar dados salvos. Usando padrão.");
      }
    }
    return INITIAL_DATABASE;
  });

  useEffect(() => {
    localStorage.setItem('cineflow_extended_db_v3', JSON.stringify(items));
  }, [items]);

  const [activeTab, setActiveTab] = useState('lista');

  // Filtros da Lista
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); 
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [sortBy, setSortBy] = useState('title-asc'); 

  // Modal de Adicionar / Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('manual'); // manual | import
  const [editingItem, setEditingItem] = useState(null);

  // Campos do Formulário Manual
  const [formTitulo, setFormTitulo] = useState('');
  const [formTipo, setFormTipo] = useState('movie');
  const [formAno, setFormAno] = useState(new Date().getFullYear());
  const [formGeneros, setFormGeneros] = useState('');
  const [formPosterUrl, setFormPosterUrl] = useState('');
  const [formStatusAssistido, setFormStatusAssistido] = useState('nao_assistido');
  const [formProgresso, setFormProgresso] = useState(0);
  const [formTemporadas, setFormTemporadas] = useState(0);
  const [formNota, setFormNota] = useState(0);
  const [formNotasPessoais, setFormNotasPessoais] = useState('');

  // Sorteador (CineMatch)
  const [matchType, setMatchType] = useState('all'); 
  const [matchStatus, setMatchStatus] = useState('nao_assistido'); 
  const [matchMinRating, setMatchMinRating] = useState(0); 
  const [matchCount, setMatchCount] = useState(3);
  const [matchedItems, setMatchedItems] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [matchMessage, setMatchMessage] = useState('');

  // Notificações (Toast)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // --- Funções do Formulário ---
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormTitulo('');
    setFormTipo('movie');
    setFormAno(new Date().getFullYear());
    setFormGeneros('');
    setFormPosterUrl('');
    setFormStatusAssistido('nao_assistido');
    setFormProgresso(0);
    setFormTemporadas(0);
    setFormNota(0);
    setFormNotasPessoais('');
    setModalMode('manual');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormTitulo(item.titulo);
    setFormTipo(item.tipo);
    setFormAno(item.ano || new Date().getFullYear());
    setFormGeneros(Array.isArray(item.generos) ? item.generos.join(', ') : '');
    setFormPosterUrl(item.poster_url || '');
    setFormStatusAssistido(item.status_assistido || 'nao_assistido');
    setFormProgresso(item.progresso_porcentagem || 0);
    setFormTemporadas(item.temporadas_assistidas_max || 0);
    setFormNota(item.nota || 0);
    setFormNotasPessoais(item.notas_pessoais || '');
    setModalMode('manual');
    setIsModalOpen(true);
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formTitulo.trim()) {
      showToast('Por favor, introduza um título!', 'error');
      return;
    }

    const generosArray = formGeneros
      ? formGeneros.split(',').map(g => g.trim()).filter(Boolean)
      : [];

    let finalProgresso = formProgresso;
    if (formStatusAssistido === 'assistido') finalProgresso = 100;
    if (formStatusAssistido === 'nao_assistido') finalProgresso = 0;

    const recordData = {
      titulo: formTitulo.trim(),
      tipo: formTipo,
      ano: Number(formAno),
      generos: generosArray,
      poster_url: formPosterUrl.trim(),
      status_assistido: formStatusAssistido,
      progresso_porcentagem: Number(finalProgresso),
      temporadas_assistidas_max: formTipo === 'series' ? Number(formTemporadas) : 0,
      nota: Number(formNota),
      notas_pessoais: formNotasPessoais.trim()
    };

    if (editingItem) {
      setItems(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...recordData } : item));
      showToast('Título atualizado com sucesso!');
    } else {
      const newItem = {
        id: `custom-${Date.now()}`,
        ...recordData,
        data_adicao: new Date().toISOString()
      };
      setItems(prev => [newItem, ...prev]);
      showToast('Novo título adicionado com sucesso!');
    }
    setIsModalOpen(false);
  };

  // --- Importar Ficheiro JSON ---
  const handleJsonImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const rawList = parsed.biblioteca || (Array.isArray(parsed) ? parsed : null);

        if (!rawList || !Array.isArray(rawList)) {
          showToast('Formato JSON incompatível. Certifique-se de que possui uma lista válida.', 'error');
          return;
        }

        setItems(prev => {
          const currentMap = new Map(prev.map(item => [item.id, item]));

          rawList.forEach((raw, idx) => {
            const id = raw.id || `imported-${Date.now()}-${idx}`;
            let status = raw.status_assistido || 'nao_assistido';
            let progresso = raw.progresso_porcentagem !== undefined ? Number(raw.progresso_porcentagem) : 0;
            if (status === 'assistido') progresso = 100;

            currentMap.set(id, {
              id,
              titulo: raw.titulo || raw.title || 'Título Desconhecido',
              tipo: raw.tipo || raw.type || 'movie',
              ano: Number(raw.ano || raw.year || new Date().getFullYear()),
              generos: Array.isArray(raw.generos) ? raw.generos : [],
              data_adicao: raw.data_adicao || raw.dateAdded || new Date().toISOString(),
              poster_url: raw.poster_url || raw.poster || '',
              status_assistido: status,
              progresso_porcentagem: progresso,
              temporadas_assistidas_max: Number(raw.temporadas_assistidas_max || 0),
              nota: Number(raw.nota || raw.rating || 0),
              notas_pessoais: raw.notas_pessoais || raw.notes || ''
            });
          });

          return Array.from(currentMap.values());
        });

        showToast(`${rawList.length} registos integrados com sucesso!`);
        setIsModalOpen(false);
      } catch (err) {
        showToast('Falha ao processar o ficheiro JSON.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Deletar Item
  const handleDeleteItem = (id, titulo) => {
    if (confirm(`Pretende remover "${titulo}" da sua biblioteca?`)) {
      setItems(prev => prev.filter(item => item.id !== id));
      setMatchedItems(prev => prev.filter(item => item.id !== id));
      showToast('Registo excluído com sucesso!', 'info');
    }
  };

  // Alteração Rápida de Status
  const handleToggleWatchedQuickly = (id) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const isCurrentlyWatched = item.status_assistido === 'assistido';
        const nextStatus = isCurrentlyWatched ? 'nao_assistido' : 'assistido';
        const nextProgress = isCurrentlyWatched ? 0 : 100;
        showToast(`Marcado como ${isCurrentlyWatched ? 'Não assistido' : 'Assistido'}`);
        return {
          ...item,
          status_assistido: nextStatus,
          progresso_porcentagem: nextProgress
        };
      }
      return item;
    }));
  };

  // Classificação Rápida
  const handleRateQuickly = (id, ratingValue) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        showToast(`Nota de ${ratingValue} estrelas guardada!`);
        return { ...item, nota: ratingValue };
      }
      return item;
    }));
  };

  // --- Filtros ---
  const processedItems = useMemo(() => {
    return items
      .filter(item => {
        const titleMatch = item.titulo.toLowerCase().includes(searchQuery.toLowerCase());
        const notesMatch = item.notas_pessoais && item.notas_pessoais.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSearch = titleMatch || notesMatch;

        const matchesType = filterType === 'all' || item.tipo === filterType;

        let matchesStatus = true;
        if (filterStatus !== 'all') {
          matchesStatus = item.status_assistido === filterStatus;
        }

        return matchesSearch && matchesType && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'title-asc') return a.titulo.localeCompare(b.titulo);
        if (sortBy === 'title-desc') return b.titulo.localeCompare(a.titulo);
        if (sortBy === 'rating-desc') return b.nota - a.nota;
        if (sortBy === 'newest') return new Date(b.data_adicao) - new Date(a.data_adicao);
        if (sortBy === 'ano-desc') return b.ano - a.ano;
        return 0;
      });
  }, [items, searchQuery, filterType, filterStatus, sortBy]);

  // --- Estatísticas ---
  const stats = useMemo(() => {
    const total = items.length;
    const movies = items.filter(i => i.tipo === 'movie').length;
    const shows = items.filter(i => i.tipo === 'series').length;
    const watched = items.filter(i => i.status_assistido === 'assistido').length;
    const inProgress = items.filter(i => i.status_assistido === 'em_andamento').length;
    const unwatched = items.filter(i => i.status_assistido === 'nao_assistido').length;
    const watchedPercent = total > 0 ? Math.round((watched / total) * 100) : 0;
    
    const ratedItems = items.filter(i => i.nota > 0);
    const avgRating = ratedItems.length > 0
      ? (ratedItems.reduce((acc, i) => acc + i.nota, 0) / ratedItems.length).toFixed(1)
      : '0.0';

    return { total, movies, shows, watched, inProgress, unwatched, watchedPercent, avgRating };
  }, [items]);

  // --- CineMatch ---
  const handleCineMatch = () => {
    setIsShuffling(true);
    setMatchedItems([]);
    setMatchMessage('');

    setTimeout(() => {
      const pool = items.filter(item => {
        const matchT = matchType === 'all' || item.tipo === matchType;
        const matchS = matchStatus === 'all' || item.status_assistido === matchStatus;
        const matchR = item.nota >= matchMinRating;
        return matchT && matchS && matchR;
      });

      if (pool.length === 0) {
        setMatchedItems([]);
        setMatchMessage('Nenhum título encontrado com esses critérios de busca.');
        setIsShuffling(false);
        return;
      }

      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(matchCount, shuffled.length));

      setMatchedItems(selected);
      setIsShuffling(false);
      showToast('Seleção CineMatch realizada!');
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-600 pb-24">
      
      {/* Header Estável */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/10">
              <svg className="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent uppercase">
                CineFlow
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">A Minha Biblioteca</p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg flex items-center space-x-1.5 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Novo Título / Importar</span>
          </button>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ==================== TAB: LISTA ==================== */}
        {activeTab === 'lista' && (
          <section className="space-y-6">
            
            {/* Bloco de Busca Avançada */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Pesquisar por título, notas ou género..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all text-sm"
                />
              </div>

              {/* Grid Filtros Rápidos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/50">
                
                {/* Categoria */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Categoria</label>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setFilterType('all')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        filterType === 'all' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Tudo
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType('movie')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        filterType === 'movie' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Filmes
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterType('series')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        filterType === 'series' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Séries/Animes
                    </button>
                  </div>
                </div>

                {/* Status Assistido */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Estado de Visualização</label>
                  <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setFilterStatus('all')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        filterStatus === 'all' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('nao_assistido')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        filterStatus === 'nao_assistido' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Pendentes
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('em_andamento')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        filterStatus === 'em_andamento' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Em Curso
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus('assistido')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                        filterStatus === 'assistido' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Vistos
                    </button>
                  </div>
                </div>

                {/* Ordenação */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Ordenar Por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="block w-full py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="title-asc">Título (A-Z)</option>
                    <option value="title-desc">Título (Z-A)</option>
                    <option value="rating-desc">Melhor Classificação</option>
                    <option value="ano-desc">Mais Recentes (Lançamento)</option>
                    <option value="newest">Adicionados Recentemente</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Cabeçalho de Resultados */}
            <div className="flex items-center justify-between px-2 text-xs">
              <span className="font-semibold text-slate-400">
                A exibir <strong className="text-white">{processedItems.length}</strong> de {items.length} registados
              </span>
              {(searchQuery || filterType !== 'all' || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                    setFilterStatus('all');
                  }}
                  className="text-purple-400 hover:text-purple-300 font-bold underline"
                >
                  Limpar Filtros
                </button>
              )}
            </div>

            {/* Lista Grid */}
            {processedItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {processedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900/80 border border-slate-800/80 hover:border-purple-500/40 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg flex flex-col justify-between group"
                  >
                    
                    {/* Header com Capa */}
                    <div className="flex items-start p-4 space-x-4">
                      {/* Imagem do Pôster */}
                      <div className="w-20 h-28 flex-shrink-0 bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-800 relative">
                        <img
                          src={item.poster_url || POSTER_FALLBACK}
                          alt={item.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = POSTER_FALLBACK;
                          }}
                        />
                        {/* Selo Tipo */}
                        <div className="absolute top-1 left-1 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider uppercase text-slate-300">
                          {item.tipo === 'movie' ? 'Filme' : 'Série'}
                        </div>
                      </div>

                      {/* Info do Card */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-slate-400">{item.ano || 'N/A'}</span>
                          
                          {/* Estado Badge */}
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase ${
                            item.status_assistido === 'assistido' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/20' :
                            item.status_assistido === 'em_andamento' ? 'bg-blue-950/80 text-blue-300 border border-blue-500/20' :
                            'bg-slate-950/80 text-slate-400 border border-slate-800'
                          }`}>
                            {item.status_assistido === 'assistido' ? 'Assistido' :
                             item.status_assistido === 'em_andamento' ? 'Em Curso' :
                             'Pendente'}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-white leading-tight truncate group-hover:text-purple-300 transition-colors" title={item.titulo}>
                          {item.titulo}
                        </h3>

                        {/* Gêneros */}
                        {Array.isArray(item.generos) && item.generos.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {item.generos.slice(0, 3).map((gen, gIdx) => (
                              <span key={gIdx} className="bg-slate-950 text-[9px] px-1.5 py-0.5 rounded text-slate-400">
                                {gen}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-600 italic">Sem géneros</span>
                        )}

                        {/* Barra de Progresso / Temporadas */}
                        {item.status_assistido === 'em_andamento' && item.tipo === 'movie' && (
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between items-center text-[9px] font-bold text-blue-400">
                              <span>Progresso</span>
                              <span>{item.progresso_porcentagem}%</span>
                            </div>
                            <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${item.progresso_porcentagem}%` }}></div>
                            </div>
                          </div>
                        )}

                        {item.tipo === 'series' && item.temporadas_assistidas_max > 0 && (
                          <div className="pt-1.5 flex items-center space-x-1">
                            <span className="text-[10px] bg-indigo-950/60 text-indigo-300 px-1.5 py-0.5 rounded font-bold border border-indigo-900/30">
                              📺 {item.temporadas_assistidas_max} {item.temporadas_assistidas_max === 1 ? 'Temp.' : 'Temps.'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notas Pessoais */}
                    {item.notas_pessoais && (
                      <p className="mx-4 mb-3 text-[10px] text-slate-400 bg-slate-950/50 p-2 rounded-lg italic line-clamp-2 border border-slate-850">
                        "{item.notas_pessoais}"
                      </p>
                    )}

                    {/* Footer do Card */}
                    <div className="px-4 py-3 bg-slate-900/40 border-t border-slate-800/80 flex items-center justify-between">
                      {/* Estrelas */}
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRateQuickly(item.id, star)}
                            className="p-0.5 hover:scale-125 transition-transform"
                          >
                            <svg
                              className={`w-3.5 h-3.5 ${
                                star <= (item.nota || 0) 
                                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_2px_rgba(251,191,36,0.2)]' 
                                  : 'text-slate-700'
                              }`}
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                      </div>

                      {/* Opções */}
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleToggleWatchedQuickly(item.id)}
                          className={`p-1 border rounded-lg text-xs transition-colors ${
                            item.status_assistido === 'assistido' 
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-500/20' 
                              : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-white'
                          }`}
                          title="Alternar Visualização"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-purple-400 border border-slate-800 rounded-lg text-xs"
                          title="Editar Ficha"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.titulo)}
                          className="p-1 bg-slate-950 hover:bg-red-950/20 text-slate-600 hover:text-red-400 border border-slate-800 rounded-lg text-xs"
                          title="Remover"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center max-w-md mx-auto">
                <p className="text-sm text-slate-400">Nenhum título encontrado com a filtragem atual.</p>
              </div>
            )}

          </section>
        )}

        {/* ==================== TAB: MATCH SORTEADOR ==================== */}
        {activeTab === 'sorteador' && (
          <section className="space-y-6 max-w-4xl mx-auto">
            
            <div className="bg-gradient-to-r from-purple-900/30 to-slate-900 p-6 rounded-2xl border border-purple-500/20 shadow-xl">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center">
                <span className="mr-2">🎲</span> CineMatch
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Configure os parâmetros de preferência e descubra sugestões diretas da sua própria coleção!
              </p>
            </div>

            {/* Configuração do Sorteio */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg grid grid-cols-1 md:grid-cols-4 gap-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Categoria</label>
                <select
                  value={matchType}
                  onChange={(e) => setMatchType(e.target.value)}
                  className="w-full py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="all">🍿 Qualquer Tipo</option>
                  <option value="movie">🎬 Filmes</option>
                  <option value="series">📺 Séries/Animes</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Estado de Visualização</label>
                <select
                  value={matchStatus}
                  onChange={(e) => setMatchStatus(e.target.value)}
                  className="w-full py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="nao_assistido">⏳ Pendentes (Não assistidos)</option>
                  <option value="em_andamento">🍿 Em Curso</option>
                  <option value="assistido">🔄 Assistidos</option>
                  <option value="all">✨ Todos</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Avaliação Mínima</label>
                <select
                  value={matchMinRating}
                  onChange={(e) => setMatchMinRating(Number(e.target.value))}
                  className="w-full py-1.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="0">✨ Sem Nota Mínima</option>
                  <option value="3">⭐ Mínimo 3 Estrelas</option>
                  <option value="4">🌟 Mínimo 4 Estrelas</option>
                </select>
              </div>

              <div className="space-y-2 flex flex-col justify-end">
                <button
                  onClick={handleCineMatch}
                  disabled={isShuffling}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  {isShuffling ? "A escolher..." : "🎲 Sortear Sugestões"}
                </button>
              </div>

            </div>

            {/* Exibição das Indicações Sorteadas */}
            <div className="pt-4">
              {isShuffling ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-2">
                  <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-400">A processar...</p>
                </div>
              ) : matchedItems.length > 0 ? (
                <div className="space-y-5">
                  <h3 className="text-center font-bold text-xs text-slate-300 uppercase tracking-widest">Recomendações Ideais para Hoje:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {matchedItems.map(item => (
                      <div
                        key={item.id}
                        className="bg-slate-900 border-2 border-purple-500/30 p-4 rounded-2xl flex space-x-3 items-start relative overflow-hidden"
                      >
                        <img
                          src={item.poster_url || POSTER_FALLBACK}
                          alt={item.titulo}
                          className="w-16 h-24 object-cover rounded-lg bg-slate-950 border border-slate-800"
                        />
                        <div className="flex-1 space-y-1">
                          <span className="text-[9px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded uppercase font-bold">
                            {item.tipo === 'movie' ? '🎬 Filme' : '📺 Série'}
                          </span>
                          <h4 className="font-bold text-sm text-white leading-tight mt-1">{item.titulo}</h4>
                          <p className="text-[10px] text-slate-400">{item.ano}</p>
                          {item.nota > 0 && <span className="text-amber-400 text-xs">★ {item.nota}/5</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/60 p-12 text-center rounded-2xl border border-slate-800">
                  <p className="text-xs text-slate-400">
                    {matchMessage || 'Defina as configurações de filtragem e pressione "Sortear Sugestões".'}
                  </p>
                </div>
              )}
            </div>

          </section>
        )}

        {/* ==================== TAB: METRICAS E PROGRESSO ==================== */}
        {activeTab === 'dashboard' && (
          <section className="space-y-6 max-w-5xl mx-auto">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acervo Geral</p>
                  <h3 className="text-2xl font-black text-white mt-1">{stats.total}</h3>
                </div>
                <div className="p-2.5 bg-purple-950/50 rounded-xl text-purple-400 text-sm">📁</div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filmes / Séries</p>
                  <h3 className="text-xl font-black text-white mt-1">
                    {stats.movies} <span className="text-xs text-slate-500">Filmes</span> / {stats.shows} <span className="text-xs text-slate-500">Séries</span>
                  </h3>
                </div>
                <div className="p-2.5 bg-indigo-950/50 rounded-xl text-indigo-400 text-sm">🎬</div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Concluídos</p>
                  <h3 className="text-2xl font-black text-emerald-400 mt-1">
                    {stats.watched} <span className="text-xs text-slate-500">({stats.watchedPercent}%)</span>
                  </h3>
                </div>
                <div className="p-2.5 bg-emerald-950/50 rounded-xl text-emerald-400 text-sm">✓</div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Em Curso</p>
                  <h3 className="text-2xl font-black text-blue-400 mt-1">{stats.inProgress}</h3>
                </div>
                <div className="p-2.5 bg-blue-950/50 rounded-xl text-blue-400 text-sm">⏳</div>
              </div>

            </div>

            {/* Conclusão Geral */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">Progresso de Visualização Total</span>
                <span className="text-purple-400 font-black">{stats.watched} de {stats.total} assistidos ({stats.watchedPercent}%)</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-850 p-0.5">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-700" style={{ width: `${stats.watchedPercent}%` }}></div>
              </div>
            </div>

            {/* Obras com Classificação de 5 Estrelas */}
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">⭐ Títulos de Excelência (Classificação Máxima)</h4>
              {items.filter(i => i.nota === 5).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {items.filter(i => i.nota === 5).map(item => (
                    <div key={item.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 truncate pr-2">{item.titulo}</span>
                      <span className="bg-amber-950 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-amber-500/20 font-black">★ 5</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Nenhum título com nota máxima atribuída por enquanto.</p>
              )}
            </div>

          </section>
        )}

      </main>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 text-center text-slate-500 text-xs mb-20">
        <p>🍿 CineFlow — Armazenamento seguro de dados locais.</p>
      </footer>

      {/* ==================== MENU FLUTUANTE INFERIOR COMPACTO E MINIMALISTA ==================== */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[85%] max-w-xs bg-slate-900/95 backdrop-blur-md border border-slate-800/80 rounded-full py-1.5 px-2 shadow-2xl flex justify-between items-center gap-1">
        <button
          onClick={() => setActiveTab('lista')}
          className={`flex-1 py-1.5 px-2.5 rounded-full flex items-center justify-center space-x-1.5 text-xs font-semibold transition-all duration-200 ${
            activeTab === 'lista' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🍿</span>
          <span>Lista</span>
        </button>

        <button
          onClick={() => setActiveTab('sorteador')}
          className={`flex-1 py-1.5 px-2.5 rounded-full flex items-center justify-center space-x-1.5 text-xs font-semibold transition-all duration-200 ${
            activeTab === 'sorteador' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🎲</span>
          <span>Match</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-1.5 px-2.5 rounded-full flex items-center justify-center space-x-1.5 text-xs font-semibold transition-all duration-200 ${
            activeTab === 'dashboard' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>📊</span>
          <span>Status</span>
        </button>
      </div>

      {/* ==================== MODAL DE ADICIONAR / EDITAR / IMPORTAR ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-slate-900 rounded-3xl border border-slate-800 max-w-md w-full p-6 shadow-2xl transition-all duration-300">
            
            {/* Abas do Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
              <div className="flex space-x-3 text-xs">
                <button
                  type="button"
                  onClick={() => setModalMode('manual')}
                  className={`pb-1 font-bold tracking-wider uppercase border-b-2 transition-all ${
                    modalMode === 'manual' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500'
                  }`}
                >
                  {editingItem ? '✏️ Detalhes' : '🍿 Manual'}
                </button>
                {!editingItem && (
                  <button
                    type="button"
                    onClick={() => setModalMode('import')}
                    className={`pb-1 font-bold tracking-wider uppercase border-b-2 transition-all ${
                      modalMode === 'import' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500'
                    }`}
                  >
                    📥 Importar JSON
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 rounded-lg border border-slate-800"
              >
                ✕
              </button>
            </div>

            {/* SEÇÃO: IMPORTAÇÃO */}
            {modalMode === 'import' ? (
              <div className="space-y-4 py-4 text-center">
                <div className="border-2 border-dashed border-slate-800 p-6 rounded-2xl bg-slate-950/40">
                  <svg className="w-10 h-10 text-purple-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-xs text-slate-300 font-semibold">Selecione o ficheiro de biblioteca `.json`</p>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleJsonImport}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                  >
                    Procurar Ficheiro
                  </button>
                </div>
              </div>
            ) : (
              /* SEÇÃO: CADASTRO MANUAL */
              <form onSubmit={handleSaveForm} className="space-y-3.5">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Título Oficial</label>
                  <input
                    type="text"
                    required
                    value={formTitulo}
                    onChange={(e) => setFormTitulo(e.target.value)}
                    placeholder="Ex: Gladiator II..."
                    className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Tipo</label>
                    <select
                      value={formTipo}
                      onChange={(e) => setFormTipo(e.target.value)}
                      className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="movie">🎬 Filme</option>
                      <option value="series">📺 Série/Anime</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Ano</label>
                    <input
                      type="number"
                      required
                      value={formAno}
                      onChange={(e) => setFormAno(e.target.value)}
                      className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Géneros (separados por vírgula)</label>
                  <input
                    type="text"
                    value={formGeneros}
                    onChange={(e) => setFormGeneros(e.target.value)}
                    placeholder="Ex: Ação, Drama, Sci-Fi"
                    className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Link para o Pôster (Capa)</label>
                  <input
                    type="url"
                    value={formPosterUrl}
                    onChange={(e) => setFormPosterUrl(e.target.value)}
                    placeholder="Ex: https://imagens-poster.com/img.jpg"
                    className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Estado de Visualização</label>
                    <select
                      value={formStatusAssistido}
                      onChange={(e) => setFormStatusAssistido(e.target.value)}
                      className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="nao_assistido">⏳ Pendente</option>
                      <option value="em_andamento">🍿 Em Curso</option>
                      <option value="assistido">✓ Assistido</option>
                    </select>
                  </div>

                  {formTipo === 'movie' ? (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Progresso (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        disabled={formStatusAssistido !== 'em_andamento'}
                        value={formStatusAssistido === 'em_andamento' ? formProgresso : (formStatusAssistido === 'assistido' ? 100 : 0)}
                        onChange={(e) => setFormProgresso(e.target.value)}
                        className="block w-full py-2 px-3 bg-slate-950 disabled:bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Temp. Assistidas</label>
                      <input
                        type="number"
                        min="0"
                        value={formTemporadas}
                        onChange={(e) => setFormTemporadas(e.target.value)}
                        className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block text-center">Classificação ({formNota} estrelas)</label>
                  <div className="flex items-center justify-center space-x-1.5 bg-slate-950 py-1.5 rounded-xl border border-slate-800">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormNota(star)}
                        className="p-1 hover:scale-125 transition-transform focus:outline-none"
                      >
                        <svg
                          className={`w-6 h-6 ${
                            star <= formNota 
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]' 
                              : 'text-slate-700'
                          }`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Anotações Pessoais</label>
                  <textarea
                    value={formNotasPessoais}
                    onChange={(e) => setFormNotasPessoais(e.target.value)}
                    placeholder="Onde assistir, ideias, anotações..."
                    rows="2"
                    className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-700 text-xs focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                  >
                    Guardar
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}