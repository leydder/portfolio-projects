package main

import (
	"fmt"

	"github.com/leydder/test-course-go/greetings"
)

func main() {
	message := greetings.Hello("alex")
	fmt.Printf(message)
}
