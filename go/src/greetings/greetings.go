package greetings

import (
	"errors"
	"fmt"
	"math/rand"
)

// Hello devuelve un saludo personalizado.
func Hello(name string) (string, error) {
	if name == "" {
		return name, errors.New("nombre vacío")
	}
	message := fmt.Sprintf(randomFormat(), name)
	return message, nil
}

// Hellos devuelve un mapa de saludos para una lista de nombres.
func Hellos(names []string) (map[string]string, error) {
	messages := make(map[string]string)
	for _, name := range names {
		message, err := Hello(name)
		if err != nil {
			return nil, err
		}
		messages[name] = message
	}
	return messages, nil
}

// randomFormat devuelve un formato aleatorio de saludo.
func randomFormat() string {
	formats := []string{
		"¡Hola, %v! ¡Bienvenido!",
		"¡Qué bueno verte, %v!",
		"¡Saludos, %v! ¡Encantado de conocerte!",
	}
	return formats[rand.Intn(len(formats))]
}
