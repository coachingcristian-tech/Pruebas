import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';

describe('flujo principal', () => {
  it('permite escribir D7 y muestra una progresión resuelta en G mayor', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/acorde inicial/i);
    await user.clear(input);
    await user.type(input, 'D7');
    await user.click(screen.getByRole('button', { name: /generar/i }));

    expect(screen.getByRole('heading', { name: /D7 → G mayor/i })).toBeInTheDocument();
    expect(screen.getByText(/D7 → G → Em → C/)).toBeInTheDocument();
  });

  it('muestra un error claro ante una entrada inválida', async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/acorde inicial/i);
    await user.clear(input);
    await user.type(input, 'H7');
    await user.click(screen.getByRole('button', { name: /generar/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/no parece un acorde válido/i);
  });
});
