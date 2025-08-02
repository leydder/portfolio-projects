package greetings

import (
	"errors"
	"fmt"
	"math/rand"
)

// Hello returns a greeting for the named person.
func Hello(name string) (string, error) {
	// If no name was given, return an error with a message.
	if name == "" {
		return name, errors.New("empty name")
	}
	// Create a message using a random format.
	message := fmt.Sprintf(randomFormat(), name)
	return message, nil
}

// Hellos returns a map that associates each of the named people
// with a greeting message.
func Hellos(names []string) (map[string]string, error) {
	// A map to associate names with messages.
	messages := make(map[string]string)
	// Loop through the received slice of names, calling
	// the Hello function to get a message for each name.
	for _, name := range names {
		message, err := Hello(name)
		if err != nil {
			return nil, err
		}
		// In the map, associate the retrieved message with
		// the name.
		messages[name] = message
	}
	return messages, nil
}

// randomFormat returns one of a set of greeting messages. The returned
// message is selected at random.
func randomFormat() string {
	// A slice of message formats.
	formats := []string{
		"Hi, %v. Welcome!",
		"Great to see you, %v!",
		"Hail, %v! Well met!",
	}

	// Return one of the message formats selected at random.
	return formats[rand.Intn(len(formats))]
}

// randomFormat devuelve uno de varios formatos de mensajes de saludo. El mensaje devuelto
// se selecciona de forma aleatoria.
func randomFormat() string {
	// Un slice de formatos de mensajes.
	formats := []string{
		"¡Hola, %v! ¡Bienvenido!",
		"¡Qué bueno verte, %v!",
		"¡Saludos, %v! ¡Encantado de conocerte!",
	}

	// Devuelve un formato de mensaje seleccionado aleatoriamente especificando
	// un índice aleatorio para el slice de formatos.
	return formats[rand.Intn(len(formats))]
}
