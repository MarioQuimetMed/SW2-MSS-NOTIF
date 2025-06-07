/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: admin.app.App;
  private readonly logger = new Logger(FirebaseService.name);

  onModuleInit() {
    try {
      // Usar variables de entorno en lugar del archivo JSON
      if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_PRIVATE_KEY &&
        process.env.FIREBASE_CLIENT_EMAIL
      ) {
        // Verificar que las variables de entorno están disponibles
        this.logger.log('Inicializando Firebase con variables de entorno');

        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(
          /\\n/g,
          '\n',
        );

        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: privateKey,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          }),
        });

        this.logger.log(
          'Firebase Admin SDK inicializado correctamente con variables de entorno',
        );
      } else {
        // Fallback para desarrollo local (sólo si existen las variables)
        this.logger.warn('Variables de entorno de Firebase no encontradas');
        throw new Error(
          'Variables de entorno de Firebase no configuradas correctamente',
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(
        `Error al inicializar Firebase Admin SDK: ${errorMessage}`,
      );
      throw error;
    }
  }

  getFirebaseAdmin() {
    return this.firebaseApp;
  }
}
