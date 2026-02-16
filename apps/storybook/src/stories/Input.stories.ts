import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { Input } from '@repo/ui'

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { Input },
    template: '<Input />',
  }),
}
