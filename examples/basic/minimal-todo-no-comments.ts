import { computed, signal } from '@preact/signals-core'
import { _EACH } from '../../src/control-structures/each.ts'
import {
  button,
  component,
  div,
  h1,
  h2,
  input,
  li,
  type MarkLess,
  p,
  renderToDom,
  ul,
} from '../../src/index.ts'
import { toRa } from './helpers.ts'

type TodoEntry = {
  val: string
  completed: boolean
}

const initialEntries: TodoEntry[] = [
  'Declarative, reusable components like in React',
  'But no need for JSX or virtual DOM',
  'Static class based "tags" for HTML elements create a visual distinction',
  'Bring your own reactivity - here using Preact Signals',
].map((entry) => ({ val: entry, completed: true }))

const firstTodo: TodoEntry = {
  val: 'Publish this thing already',
  completed: false,
}

const MinimalTodo = () =>
  component((): MarkLess => {
    const [_todos, todosSig] = toRa(signal([firstTodo, ...initialEntries]))

    const [done] = toRa(
      computed(() => todosSig.value.filter((t) => t.completed)),
    )
    const [open] = toRa(
      computed(() => todosSig.value.filter((t) => !t.completed)),
    )

    let inputRef: HTMLInputElement | null = null

    const addTodo = () => {
      if (inputRef && inputRef.value.trim() !== '') {
        const newTodo: TodoEntry = {
          val: inputRef.value.trim(),
          completed: false,
        }
        todosSig.value = [...todosSig.value, newTodo]
        inputRef.value = ''
      }
    }

    const toggleTodo = (todo: TodoEntry) => {
      todosSig.value = todosSig.value.map((t) => {
        if (t === todo) {
          return { ...t, completed: !t.completed }
        }
        return t
      })
    }

    // biome-ignore format: custom layout needed
    const listItem = (todo: TodoEntry) =>
      li._([
        div._([todo.completed ? '✅ ' : '📝 ']),
        div._(todo.val),
      ])
      .event('click', () => toggleTodo(todo))

    // biome-ignore format: custom layout needed
    return [

      h1._('Minimal Todo List'),
      p._('A simple todo list example using markless.'),

      input
        .attr('placeholder', 'New Entry')
        .setRef(ref => { inputRef = ref }),

      button._('Add Todo').event('click', addTodo),

      div.class('list-wrapper')._([

        h2._('Open Todos'),
        ul.class('todo-list')._(
          _EACH(open, i => i.val)
            .DO(item => listItem(item))
          ),

        h2._('Completed Todos'),
        ul.class('todo-list completed')._(
          _EACH(done, i => i.val)
            .DO(item => listItem(item))
          )

      ])
    ]
  })

renderToDom(document.body, MinimalTodo())
