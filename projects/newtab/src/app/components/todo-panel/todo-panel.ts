import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoService } from '@shared/services/todo.service';

@Component({
  selector: 'app-todo-panel',
  imports: [FormsModule],
  templateUrl: './todo-panel.html',
  styleUrl: './todo-panel.scss',
})
export class TodoPanel implements OnInit {
  protected readonly todoService = inject(TodoService);
  protected readonly draft = signal('');
  protected readonly todos = this.todoService.todos;

  ngOnInit(): void {
    this.todoService.load();
  }

  async addTodo(): Promise<void> {
    const value = this.draft();
    if (!value.trim()) return;
    await this.todoService.add(value);
    this.draft.set('');
  }
}
