import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { DataSource } from "typeorm";

const movieData = {
  title: "Inception",
  director: "Christopher Nolan",
  genre: "sci-fi",
  year: 2010,
  rating: 8.8,
  synopsis:
    "A thief who steals corporate secrets through the use of dream-sharing technology.",
};

const updateData = {
  rating: 9.0,
  synopsis: "Updated synopsis for testing purposes.",
};

const invalidUuid = "not-a-valid-uuid";
const nonExistentUuid = "00000000-0000-4000-a000-000000000000";

describe("Movies E2E", () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let createdMovieId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        errorHttpStatusCode: 422,
      }),
    );
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    await dataSource.query("DELETE FROM movies");
  });

  afterAll(async () => {
    await dataSource.query("DELETE FROM movies");
    await app.close();
  });

  describe("Movies Search (e2e)", () => {
    const seed = [
      {
        title: "Inception",
        director: "Nolan",
        genre: "sci-fi",
        year: 2010,
        rating: 8.8,
      },
      {
        title: "Interstellar",
        director: "Nolan",
        genre: "sci-fi",
        year: 2014,
        rating: 8.6,
      },
    ];

    beforeAll(async () => {
      await dataSource.query("DELETE FROM movies");
      for (const m of seed) {
        await request(app.getHttpServer()).post("/movies").send(m);
      }
    });

    it("/movies/search", () => {
      return request(app.getHttpServer()).get("/movies/search").expect(200);
    });
  });

  // Aquí las pruebas
});
