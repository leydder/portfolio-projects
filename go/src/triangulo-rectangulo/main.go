// package triangulorectangulo
package main

import (
	"fmt"
	"math"
)

func main() {

	// Declaración de variables
	var lado1, lado2 float64

	// Solicitar al usuario los lados
	fmt.Print("Ingrese lado 1: ")
	fmt.Scan(&lado1)

	fmt.Print("Ingrese lado 2: ")
	fmt.Scan(&lado2)

	// Calcular hipotenusa con Pitágoras
	hipotenusa := math.Sqrt(lado1*lado1 + lado2*lado2)

	// Calcular área
	area := (lado1 * lado2) / 2

	// Calcular perímetro
	perimetro := lado1 + lado2 + hipotenusa

	// Imprimir resultados con 2 decimales
	fmt.Printf("Área: %.2f\n", area)
	fmt.Printf("Perímetro: %.2f\n", perimetro)
}
