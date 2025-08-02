package greetings

import (
	"regexp"
	"testing"
)

// TestHelloName llama a greetings.Hello con un nombre y verifica
// que se retorne un valor válido.
func TestHelloName(t *testing.T) {
	nombre := "Gladys"
	want := regexp.MustCompile(`\b` + nombre + `\b`)
	msg, err := Hello("Gladys")
	if !want.MatchString(msg) || err != nil {
		t.Fatalf(`Hello("Gladys") = %q, %v, quiere coincidencia para %#q, nil`, msg, err, want)
	}
}

// TestHelloEmpty llama a greetings.Hello con una cadena vacía
// y verifica que se retorne un error.
func TestHelloEmpty(t *testing.T) {
	msg, err := Hello("")
	if msg != "" || err == nil {
		t.Fatalf(`Hello("") = %q, %v, quiere "", error`, msg, err)
	}
}
