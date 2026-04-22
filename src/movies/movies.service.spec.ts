import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ObjectLiteral, Repository } from "typeorm";
import { NotFoundException } from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { Movie } from "./entities/movie.entity";
import { Genre } from "./entities/movie.entity";
import { CreateMovieDto } from "./dto/create-movie.dto";
import { UpdateMovieDto } from "./dto/update-movie.dto";
import { MoreThanOrEqual } from "typeorm";

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
});

const movieData: CreateMovieDto = {
  title: "Inception",
  director: "Christopher Nolan",
  genre: Genre.SCIFI,
  year: 2010,
  rating: 8.8,
  synopsis:
    "A thief who steals corporate secrets through the use of dream-sharing technology.",
};

const mockMovie: Movie = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: movieData.title,
  director: movieData.director,
  genre: movieData.genre,
  year: movieData.year,
  rating: movieData.rating,
  synopsis: movieData.synopsis ?? "",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("MoviesService", () => {
  let service: MoviesService;
  let repository: MockRepository<Movie>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    repository = module.get<MockRepository<Movie>>(getRepositoryToken(Movie));
  });

  // Prueba 1
  it("El servicio debe estar definido", () => {
    expect(service).toBeDefined();
  });

  // Aquí las pruebas
  describe("create", () => {
    //prueba 2
    it("debería crear una nueva película", async () => {
      repository.create!.mockReturnValue(mockMovie);
      repository.save!.mockResolvedValue(mockMovie);

      const result = service.create(movieData);
      expect(repository.create).toHaveBeenCalledWith(movieData);
      expect(repository.save).toHaveBeenCalledWith(mockMovie);
      expect(result).toEqual(mockMovie);
    });
    //prueba 3
    it("debe asignar un uuid automáticamente al crear una película", async () => {
      //preparar el mock para que simule la creación de una película con un id generado automáticamente
      const movieWithoutId = {
        ...movieData,
        id: "550e8400-e29b-41d4-a716-446655440000",
      };

      repository.create!.mockReturnValue(mockMovie);
      repository.save!.mockResolvedValue(mockMovie);

      //hacer la prueba del metodo create del servicio
      const result = await service.create(movieData);

      // indicar que es lo que se debe verificar
      expect(result.id).toBeDefined();
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });
  });

  describe("search", () => {
    // B1
    it("search() sin filtros debe retornar todas las películas", async () => {
      repository.find!.mockResolvedValue([mockMovie]);

      const result = await service.search({});

      expect(repository.find).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual([mockMovie]);
    });

    // B2
    it("search por genre debe construir filtro correcto", async () => {
      repository.find!.mockResolvedValue([mockMovie]);

      const result = await service.search({ genre: Genre.DRAMA });

      expect(repository.find).toHaveBeenCalledWith({
        where: { genre: Genre.DRAMA },
      });
      expect(result).toEqual([mockMovie]);
    });

    // B3
    it("search por year debe construir filtro correcto", async () => {
      repository.find!.mockResolvedValue([mockMovie]);

      const result = await service.search({ year: 2010 });

      expect(repository.find).toHaveBeenCalledWith({
        where: { year: 2010 },
      });
      expect(result).toEqual([mockMovie]);
    });

    // B4
    it("search por minRating debe usar MoreThanOrEqual", async () => {
      repository.find!.mockResolvedValue([mockMovie]);

      await service.search({ minRating: 8 });

      expect(repository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          rating: expect.any(Object),
        }),
      });
    });

    // B5
    it("search combinando filtros (AND)", async () => {
      repository.find!.mockResolvedValue([mockMovie]);

      await service.search({
        genre: Genre.DRAMA,
        year: 2010,
        minRating: 8,
      });

      expect(repository.find).toHaveBeenCalledWith({
        where: expect.objectContaining({
          genre: Genre.DRAMA,
          year: 2010,
          rating: expect.any(Object),
        }),
      });
    });

    // B6
    it("search debe retornar array vacío si no hay resultados", async () => {
      repository.find!.mockResolvedValue([]);

      const result = await service.search({ genre: Genre.HORROR });

      expect(result).toEqual([]);
    });
  });
});
