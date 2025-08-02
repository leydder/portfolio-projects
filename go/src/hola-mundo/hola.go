package main

import (
	"fmt"

	"rsc.io/quote"
)

func main() {
	var name string
	var age int

	fmt.Print("Ingrese su nombre: ")
	fmt.Scanln(&name)

	fmt.Print("Ingrese su edad: ")
	fmt.Scanln(&age)

	fmt.Println("What's up?")
	fmt.Println(quote.Hello()) // Frase clásica: "Hello, world."

	// Conversión explícita entre tipos enteros
	var integer16 int16 = 50
	var integer32 int32 = 100
	suma := int32(integer16) + integer32
	fmt.Println("Suma de enteros:", suma)

	// Salida formateada
	fmt.Printf("Hola, mi nombre es %s y tengo %d años.\n", name, age)
}
