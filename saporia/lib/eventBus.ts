import { EventEmitter } from 'events';

// Singleton event bus for app-wide events (mimics a queue)
const eventBus = new EventEmitter();

export default eventBus;
