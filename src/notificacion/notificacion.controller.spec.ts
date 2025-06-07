import { Test, TestingModule } from '@nestjs/testing';
import { NotificacionController } from './notificacion.controller';

describe('NotificacionController', () => {
  let controller: NotificacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificacionController],
    }).compile();

    controller = module.get<NotificacionController>(NotificacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
