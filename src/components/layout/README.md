# Layout Components

Flexible layout components to help structure your UI with consistent spacing and alignment.

## Container Component

A centered container with max-width and responsive padding.

```jsx
import { Container } from '@/components/layout';

// Basic usage
<Container>
  <p>Content goes here</p>
</Container>

// Fluid container (100% width)
<Container fluid>
  <p>Full-width content</p>
</Container>

// Without default padding
<Container noPadding>
  <p>Content without padding</p>
</Container>

// With custom class
<Container className="custom-container">
  <p>Content with custom class</p>
</Container>
```

## Row Component

A flex container with horizontal (row) direction.

```jsx
import { Row } from '@/components/layout';

// Basic usage
<Row>
  <div>Item 1</div>
  <div>Item 2</div>
</Row>

// With spacing
<Row gap={2}>
  <div>Item 1</div>
  <div>Item 2</div>
</Row>

// With justification
<Row justifyContent="between" fullWidth>
  <div>Left aligned</div>
  <div>Right aligned</div>
</Row>

// With alignment
<Row alignItems="center">
  <div>Centered vertically</div>
</Row>

// Full example
<Row
  gap={3}
  justifyContent="between"
  alignItems="center"
  fullWidth
  className="custom-class"
>
  <div>Item 1</div>
  <div>Item 2</div>
</Row>
```

## Column Component

A flex container with vertical (column) direction.

```jsx
import { Column } from '@/components/layout';

// Basic usage
<Column>
  <div>Item 1</div>
  <div>Item 2</div>
</Column>

// With spacing
<Column gap={2}>
  <div>Item 1</div>
  <div>Item 2</div>
</Column>

// With justification
<Column justifyContent="between" fullHeight>
  <div>Top aligned</div>
  <div>Bottom aligned</div>
</Column>

// With alignment
<Column alignItems="center">
  <div>Centered horizontally</div>
</Column>

// Full example
<Column
  gap={3}
  justifyContent="between"
  alignItems="center"
  fullWidth
  fullHeight
  className="custom-class"
>
  <div>Item 1</div>
  <div>Item 2</div>
</Column>
```

## Props

### Container Props

| Prop      | Type      | Default | Description                                    |
| --------- | --------- | ------- | ---------------------------------------------- |
| children  | ReactNode | -       | Content to render within the container         |
| className | string    | -       | Additional CSS class                           |
| fluid     | boolean   | false   | Whether to use 100% width instead of max-width |
| noPadding | boolean   | false   | Whether to remove default padding              |

### Row and Column Props

| Prop           | Type                                                              | Default | Description                                           |
| -------------- | ----------------------------------------------------------------- | ------- | ----------------------------------------------------- |
| children       | ReactNode                                                         | -       | Content to render within the container                |
| className      | string                                                            | -       | Additional CSS class                                  |
| gap            | number \| string                                                  | -       | Spacing between items (numbers are multiplied by 8px) |
| wrap           | boolean                                                           | false   | Whether items should wrap to next line/column         |
| fullWidth      | boolean                                                           | false   | Whether container should take full width              |
| fullHeight     | boolean                                                           | false   | Whether container should take full height             |
| justifyContent | 'start' \| 'end' \| 'center' \| 'between' \| 'around' \| 'evenly' | -       | Justify content alignment                             |
| alignItems     | 'start' \| 'end' \| 'center' \| 'baseline' \| 'stretch'           | -       | Align items alignment                                 |
