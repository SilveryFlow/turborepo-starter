import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Button } from '@repo/ui'

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'radio',
      options: ['button', 'submit', 'reset'],
    },
  },
  args: {
    type: 'button',
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Button</Button>',
  }),
}
