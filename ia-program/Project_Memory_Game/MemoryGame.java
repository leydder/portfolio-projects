import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.*;

public class MemoryGame extends JFrame {
    private JButton[][] cards;
    private int[][] cardValues;
    private boolean[][] revealed;
    private JButton firstCard = null;
    private JButton secondCard = null;
    private int firstRow = -1, firstCol = -1;
    private int secondRow = -1, secondCol = -1;
    private int pairsFound = 0;
    private int totalPairs = 8; // 4x4 grid = 8 pairs
    private JLabel scoreLabel;
    private JLabel movesLabel;
    private int moves = 0;
    private javax.swing.Timer timer;
    
    // Iconos para las cartas (usando emojis como alternativa a imágenes)
    private String[] cardIcons = {"🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"};
    
    public MemoryGame() {
        setTitle("Juego de Parejas - Memory Game");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setResizable(false);
        
        // Inicializar arrays
        cards = new JButton[4][4];
        cardValues = new int[4][4];
        revealed = new boolean[4][4];
        
        // Crear panel principal
        JPanel mainPanel = new JPanel(new BorderLayout());
        
        // Panel superior para puntuación
        JPanel topPanel = new JPanel(new FlowLayout());
        scoreLabel = new JLabel("Parejas encontradas: 0/" + totalPairs);
        movesLabel = new JLabel("Movimientos: 0");
        topPanel.add(scoreLabel);
        topPanel.add(new JLabel("  |  "));
        topPanel.add(movesLabel);
        mainPanel.add(topPanel, BorderLayout.NORTH);
        
        // Panel del juego
        JPanel gamePanel = new JPanel(new GridLayout(4, 4, 5, 5));
        gamePanel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
        
        // Crear botones de cartas
        createCards();
        
        // Agregar botones al panel
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                gamePanel.add(cards[i][j]);
            }
        }
        
        mainPanel.add(gamePanel, BorderLayout.CENTER);
        
        // Panel inferior para botones de control
        JPanel bottomPanel = new JPanel(new FlowLayout());
        JButton newGameButton = new JButton("Nuevo Juego");
        JButton resetButton = new JButton("Reiniciar");
        
        newGameButton.addActionListener(e -> newGame());
        resetButton.addActionListener(e -> resetGame());
        
        bottomPanel.add(newGameButton);
        bottomPanel.add(resetButton);
        mainPanel.add(bottomPanel, BorderLayout.SOUTH);
        
        add(mainPanel);
        pack();
        setLocationRelativeTo(null);
        
        // Inicializar el juego
        newGame();
    }
    
    private void createCards() {
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                cards[i][j] = new JButton("?");
                cards[i][j].setFont(new Font("Arial", Font.BOLD, 24));
                cards[i][j].setPreferredSize(new Dimension(80, 80));
                cards[i][j].setBackground(Color.LIGHT_GRAY);
                
                final int row = i;
                final int col = j;
                
                cards[i][j].addActionListener(e -> cardClicked(row, col));
            }
        }
    }
    
    private void initializeCardValues() {
        // Crear array con pares de valores
        ArrayList<Integer> values = new ArrayList<>();
        for (int i = 0; i < 8; i++) {
            values.add(i);
            values.add(i);
        }
        
        // Mezclar valores
        Collections.shuffle(values);
        
        // Asignar valores a las cartas
        int index = 0;
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                cardValues[i][j] = values.get(index++);
                revealed[i][j] = false;
            }
        }
    }
    
    private void cardClicked(int row, int col) {
        // Si la carta ya está revelada, no hacer nada
        if (revealed[row][col]) {
            return;
        }
        
        // Si ya hay dos cartas seleccionadas, esperar
        if (firstCard != null && secondCard != null) {
            return;
        }
        
        // Revelar la carta
        cards[row][col].setText(cardIcons[cardValues[row][col]]);
        cards[row][col].setBackground(Color.WHITE);
        
        if (firstCard == null) {
            // Primera carta seleccionada
            firstCard = cards[row][col];
            firstRow = row;
            firstCol = col;
        } else {
            // Segunda carta seleccionada
            secondCard = cards[row][col];
            secondRow = row;
            secondCol = col;
            moves++;
            movesLabel.setText("Movimientos: " + moves);
            
            // Verificar si son pareja
            if (cardValues[firstRow][firstCol] == cardValues[secondRow][secondCol]) {
                // Son pareja
                revealed[firstRow][firstCol] = true;
                revealed[secondRow][secondCol] = true;
                pairsFound++;
                scoreLabel.setText("Parejas encontradas: " + pairsFound + "/" + totalPairs);
                
                // Verificar si el juego terminó
                if (pairsFound == totalPairs) {
                    gameWon();
                }
                
                // Resetear selección
                firstCard = null;
                secondCard = null;
                firstRow = -1;
                firstCol = -1;
                secondRow = -1;
                secondCol = -1;
            } else {
                // No son pareja, ocultar después de un delay
                timer = new javax.swing.Timer(1000, e -> {
                    cards[firstRow][firstCol].setText("?");
                    cards[firstRow][firstCol].setBackground(Color.LIGHT_GRAY);
                    cards[secondRow][secondCol].setText("?");
                    cards[secondRow][secondCol].setBackground(Color.LIGHT_GRAY);
                    
                    firstCard = null;
                    secondCard = null;
                    firstRow = -1;
                    firstCol = -1;
                    secondRow = -1;
                    secondCol = -1;
                    
                    timer.stop();
                });
                timer.start();
            }
        }
    }
    
    private void gameWon() {
        JOptionPane.showMessageDialog(this, 
            "¡Felicitaciones! Has completado el juego en " + moves + " movimientos.",
            "¡Juego Completado!", 
            JOptionPane.INFORMATION_MESSAGE);
    }
    
    private void newGame() {
        initializeCardValues();
        resetGame();
    }
    
    private void resetGame() {
        // Resetear todas las cartas
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                cards[i][j].setText("?");
                cards[i][j].setBackground(Color.LIGHT_GRAY);
                revealed[i][j] = false;
            }
        }
        
        // Resetear variables
        firstCard = null;
        secondCard = null;
        firstRow = -1;
        firstCol = -1;
        secondRow = -1;
        secondCol = -1;
        pairsFound = 0;
        moves = 0;
        
        // Actualizar labels
        scoreLabel.setText("Parejas encontradas: 0/" + totalPairs);
        movesLabel.setText("Movimientos: 0");
        
        // Detener timer si está activo
        if (timer != null && timer.isRunning()) {
            timer.stop();
        }
    }
    
    public static void main(String[] args) {
        // Ejecutar en el EDT (Event Dispatch Thread)
        SwingUtilities.invokeLater(() -> {
            new MemoryGame().setVisible(true);
        });
    }
} 