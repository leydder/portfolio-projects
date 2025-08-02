package main

import (
	"fmt"
	"greetings"
)

func main() {

	message, err := greetings.Hello("alex")
	if err != nil {
		fmt.Println("Ocurrio un error", err)
		return
	}
	fmt.Println(message)
}