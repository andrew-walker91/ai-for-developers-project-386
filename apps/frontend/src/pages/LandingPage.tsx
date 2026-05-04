import { Title, Text, Button, Stack, SimpleGrid, Card, Paper } from '@mantine/core';
import { Link } from 'react-router-dom';

const features = [
  { title: 'Простая запись', desc: 'Выберите удобное время за пару кликов' },
  { title: 'Разные типы встреч', desc: '15 или 30 минут — выберите подходящий формат' },
  { title: 'Без регистрации', desc: 'Запишитесь без создания аккаунта' },
];

export function LandingPage() {
  return (
    <Stack gap="xl" py="xl">
      <Paper bg="blue" p="xl" radius="md" ta="center">
        <Title order={1} c="white" mb="md">
          Запишитесь на встречу
        </Title>
        <Text size="lg" c="white" maw={500} mx="auto" mb="lg" style={{ opacity: 0.85 }}>
          Выберите тип встречи и свободное время. Без регистрации, без лишних шагов.
        </Text>
        <Button size="lg" variant="white" component={Link} to="/event-types">
          Записаться
        </Button>
      </Paper>

      <Title order={2} ta="center">
        Возможности
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        {features.map((f) => (
          <Card key={f.title} shadow="sm" padding="lg" radius="md" withBorder>
            <Text fw={600} mb="xs">{f.title}</Text>
            <Text size="sm" c="dimmed">{f.desc}</Text>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
