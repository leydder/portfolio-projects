package animal

import (
	"fmt"
)

type Animal interface {
	Sonido()
}

// Estrucuta de perro y sus metodos
type Perro struct {
	Nombre string
}

func (p *Perro) Sonido() {
	fmt.Println(p.Nombre + "Hace guau guau")
}

// Estrucuta de Gato y sus metodos
type Gato struct {
	Nombre string
}

func (p *Gato) Sonido() {
	fmt.Println(p.Nombre + "Hace miau")
}

// Funcion para imprimir sonido
func HacerSonido(animal Animal) {
	animal.Sonido()
}
