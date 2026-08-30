import { Injectable, signal } from '@angular/core';
import { ChromeStorageService } from './chrome-storage.service';
import { Todo } from '../models/models';

const STORAGE_KEY = 'todos';

@Injectable({ providedIn: 'root' })
export class TodoService {
  readonly todos = signal<Todo[]>([]);

  constructor(private readonly storage: ChromeStorageService) {}

  async load(): Promise<void> {
    const stored = await this.storage.get<{ todos: Todo[] }>('local', [STORAGE_KEY]);
    this.todos.set(stored.todos ?? []);
  }

  async add(text: string): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) return;
    const next = [...this.todos(), { id: crypto.randomUUID(), text: trimmed, done: false }];
    await this.persist(next);
  }

  async toggle(id: string): Promise<void> {
    const next = this.todos().map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo));
    await this.persist(next);
  }

  async remove(id: string): Promise<void> {
    const next = this.todos().filter((todo) => todo.id !== id);
    await this.persist(next);
  }

  private async persist(todos: Todo[]): Promise<void> {
    this.todos.set(todos);
    await this.storage.set('local', { [STORAGE_KEY]: todos });
  }
}
