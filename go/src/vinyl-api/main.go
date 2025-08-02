package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type album struct {
	ID     string  `json:"id"`
	Title  string  `json:"title"`
	Artist string  `json:"artist"`
	Price  float64 `json:"price"`
}

var albums = []album{
	{ID: "1", Title: "Blue Rain", Artist: "Jhon coltrane", Price: 56.99},
	{ID: "2", Title: "Jeru", Artist: "Gerry Mulligan", Price: 17.99},
	{ID: "3", Title: "Sara Vaugnan and clfford Brown", Artist: "Sara Vaugnan", Price: 50.45},
}

// GET /albums
func getAlbums(c *gin.Context) {
	c.IndentedJSON(http.StatusOK, albums)
}

// POST /albums
func postAlbums(c *gin.Context) {
	var newAlbum album
	if err := c.BindJSON(&newAlbum); err != nil {
		return
	}
	albums = append(albums, newAlbum)
	c.IndentedJSON(http.StatusCreated, newAlbum)
}

// GET /albums/:id
func getAlbumsByID(c *gin.Context) {
	id := c.Param("id")
	for _, a := range albums {
		if a.ID == id {
			c.IndentedJSON(http.StatusOK, a)
			return
		}
	}
	c.IndentedJSON(http.StatusNotFound, gin.H{"message": "album no encontrado"})
}

// PUT /albums/:id
func updateAlbum(c *gin.Context) {
	id := c.Param("id")
	var updated album

	if err := c.BindJSON(&updated); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "datos inválidos"})
		return
	}

	for i, a := range albums {
		if a.ID == id {
			albums[i] = updated
			c.IndentedJSON(http.StatusOK, updated)
			return
		}
	}
	c.IndentedJSON(http.StatusNotFound, gin.H{"message": "álbum no encontrado para actualizar"})
}

// DELETE /albums/:id
func deleteAlbum(c *gin.Context) {
	id := c.Param("id")
	for i, a := range albums {
		if a.ID == id {
			albums = append(albums[:i], albums[i+1:]...)
			c.JSON(http.StatusOK, gin.H{"message": "álbum eliminado"})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"message": "álbum no encontrado para eliminar"})
}

func main() {
	router := gin.Default()

	router.GET("/albums", getAlbums)
	router.GET("/albums/:id", getAlbumsByID)
	router.POST("/albums", postAlbums)
	router.PUT("/albums/:id", updateAlbum)
	router.DELETE("/albums/:id", deleteAlbum)

	router.Run("localhost:8080")
}
