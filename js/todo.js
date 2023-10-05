$(document).ready(function () {
  chrome.storage.sync.get('enableTodo', function (data) {
   let indexContainer = document.getElementById('container')
    if (data.enableTodo) {
      let todoAppContainer = document.createElement('section')
      todoAppContainer.id = 'right'
      todoAppContainer.classList.add(['layout','todoApp'])
      indexContainer.appendChild(todoAppContainer)
      let todoContainer = document.createElement('div')
      todoContainer.id = 'todo'
      let todoList = document.createElement('ul')
      todoList.id = 'list-items'
      todoContainer.appendChild(todoList)
      todoAppContainer.appendChild(todoContainer)

      let form = document.createElement('form')
      form.classList.add('add-items')
      todoAppContainer.appendChild(form)
      let input = document.createElement('input')
      input.type = 'text'
      input.classList.add('form-control')
      input.id = 'todo-list-item'
      input.placeholder="What do you need to do?"
      form.appendChild(input)
      let btn = document.createElement('button')
      btn.classList.add('add')
      btn.type='submit'
      btn.innerText='Add to List'

      form.appendChild(btn)

      $('#list-items').html(localStorage.getItem('listItems'));

      $('.add-items').submit(function (event) {
        event.preventDefault();

        var item = $('#todo-list-item').val();

        if (item) {
          $('#list-items').append("<li><input class='checkbox' type='checkbox'/>" + item + "<a class='remove'>x</a><hr></li>");
          localStorage.setItem('listItems', $('#list-items').html());
          $('#todo-list-item').val("");
        }
      });

      $(document).on('change', '.checkbox', function () {
        if ($(this).attr('checked')) {
          $(this).removeAttr('checked');
        }
        else {
          $(this).attr('checked', 'checked');
        }

        $(this).parent().toggleClass('completed');

        localStorage.setItem('listItems', $('#list-items').html());
      });

      $(document).on('click', '.remove', function () {
        $(this).parent().remove();

        localStorage.setItem('listItems', $('#list-items').html());
      });
    }
  })
});
