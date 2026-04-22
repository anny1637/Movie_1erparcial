import { Test } from "@nestjs/testing";
import request from "supertest";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { MoviesController } from "./movies.controller";
import { MoviesService } from "./movies.service";


describe("MoviesController", () => {
  let app: INestApplication;
  const mockService = {
    search: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [{ provide: MoviesService, useValue: mockService }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, errorHttpStatusCode: 422 }),
    );
    await app.init();
  });

  it("GET /movies/search", () => {
    mockService.search.mockResolvedValue([]);
    return request(app.getHttpServer()).get("/movies/search").expect(200);
  });

  it("valida genre inválido", () => {
    return request(app.getHttpServer())
      .get("/movies/search?genre=invalid")
      .expect(422);
  });

  it("valida year inválido", () => {
    return request(app.getHttpServer())
      .get("/movies/search?year=1500")
      .expect(422);
  });
});
