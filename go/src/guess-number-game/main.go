package main

import (
	"fmt"
	"math/rand"
	"strings"
	"time"
)

func main() {
	rand.Seed(time.Now().UnixNano()) // Semilla aleatoria una sola vez
	play()
}

func play() {
	numAleatorio := rand.Intn(100) // Número entre 0 y 99
	var numIngresado int
	const maxIntentos = 10
	intentos := 0

	for intentos < maxIntentos {
		intentos++
		fmt.Printf("Ingresa un número (intentos restantes: %d): ", maxIntentos-intentos+1)
		_, err := fmt.Scanln(&numIngresado)
		if err != nil {
			fmt.Println("Entrada inválida. Intenta de nuevo.")
			continue
		}

		if numIngresado == numAleatorio {
			fmt.Println("🎉 ¡Felicitaciones, adivinaste el número!")
			playAgain()
			return
		} else if numIngresado < numAleatorio {
			fmt.Println("🔺 El número a adivinar es mayor.")
		} else {
			fmt.Println("🔻 El número a adivinar es menor.")
		}
	}

	fmt.Printf("❌ Se acabaron los intentos. El número era: %d\n", numAleatorio)
	playAgain()
}

func playAgain() {
	var eleccion string
	fmt.Print("¿Quieres jugar de nuevo? (s/n): ")
	fmt.Scanln(&eleccion)
	eleccion = strings.ToLower(eleccion)

	switch eleccion {
	case "s":
		play()
	case "n":
		fmt.Println("Gracias por jugar.")
	default:
		fmt.Println("Elección inválida. Intenta de nuevo.")
		playAgain()
	}
}
