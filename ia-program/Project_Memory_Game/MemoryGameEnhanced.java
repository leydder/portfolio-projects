import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.*;

public class MemoryGameEnhanced extends JFrame {
    private JButton[][] cards;
    private int[][] cardValues;
    private boolean[][] revealed;
    private JButton firstCard = null;
    private JButton secondCard = null;
    private int firstRow = -1, firstCol = -1;
    private int secondRow = -1, secondCol = -1;
    private int pairsFound = 0;
    private int totalPairs = 8;
    private JLabel scoreLabel;
    private JLabel movesLabel;
    private JLabel timeLabel;
    private JLabel levelLabel;
    private int moves = 0;
    private int level = 1;
    private int timeElapsed = 0;
    private javax.swing.Timer timer;
    private javax.swing.Timer gameTimer;
    private boolean gameStarted = false;
    
    // Iconos para las cartas con diferentes temas
    private String[][] cardThemes = {
        {"🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"}, // Animales
        {"🍎", "🍌", "🍇", "🍊", "🍓", "🍑", "🥝", "🍍"}, // Frutas
        {"⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱"}, // Deportes
        {"🌞", "🌙", "⭐", "☁️", "🌈", "❄️", "🌺", "🌸"}, // Naturaleza
        {"🚗", "🚕", "🚙", "🚌", "🏎️", "🚓", "🚑", "🚒"}  // Vehículos
    };
    
    private int currentTheme = 0;
    
    public MemoryGameEnhanced() {
        setTitle("Juego de Parejas Mejorado - Memory Game Enhanced");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setResizable(false);
        
        // Inicializar arrays
        cards = new JButton[4][4];
        cardValues = new int[4][4];
        revealed = new boolean[4][4];
        
        // Crear panel principal
        JPanel mainPanel = new JPanel(new BorderLayout());
        
        // Panel superior para información del juego
        JPanel topPanel = new JPanel(new GridLayout(2, 1));
        
        // Primera fila: nivel y tema
        JPanel infoRow1 = new JPanel(new FlowLayout());
        levelLabel = new JLabel("Nivel: 1");
        JLabel themeLabel = new JLabel("Tema: Animales");
        infoRow1.add(levelLabel);
        infoRow1.add(new JLabel("  |  "));
        infoRow1.add(themeLabel);
        
        // Segunda fila: puntuación, movimientos y tiempo
        JPanel infoRow2 = new JPanel(new FlowLayout());
        scoreLabel = new JLabel("Parejas: 0/" + totalPairs);
        movesLabel = new JLabel("Movimientos: 0");
        timeLabel = new JLabel("Tiempo: 00:00");
        infoRow2.add(scoreLabel);
        infoRow2.add(new JLabel("  |  "));
        infoRow2.add(movesLabel);
        infoRow2.add(new JLabel("  |  "));
        infoRow2.add(timeLabel);
        
        topPanel.add(infoRow1);
        topPanel.add(infoRow2);
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
        JButton nextLevelButton = new JButton("Siguiente Nivel");
        JButton changeThemeButton = new JButton("Cambiar Tema");
        
        newGameButton.addActionListener(e -> newGame());
        resetButton.addActionListener(e -> resetGame());
        nextLevelButton.addActionListener(e -> nextLevel());
        changeThemeButton.addActionListener(e -> changeTheme());
        
        bottomPanel.add(newGameButton);
        bottomPanel.add(resetButton);
        bottomPanel.add(nextLevelButton);
        bottomPanel.add(changeThemeButton);
        mainPanel.add(bottomPanel, BorderLayout.SOUTH);
        
        add(mainPanel);
        pack();
        setLocationRelativeTo(null);
        
        // Inicializar el juego
        newGame();
        
        // Iniciar timer del juego
        startGameTimer();
    }
    
    private void createCards() {
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                cards[i][j] = new JButton("?");
                cards[i][j].setFont(new Font("Arial", Font.BOLD, 24));
                cards[i][j].setPreferredSize(new Dimension(80, 80));
                cards[i][j].setBackground(new Color(200, 200, 200));
                cards[i][j].setBorder(BorderFactory.createRaisedBevelBorder());
                
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
        
        // Iniciar el juego si es la primera carta
        if (!gameStarted) {
            gameStarted = true;
        }
        
        // Revelar la carta con efecto visual
        cards[row][col].setText(cardThemes[currentTheme][cardValues[row][col]]);
        cards[row][col].setBackground(new Color(255, 255, 200));
        cards[row][col].setBorder(BorderFactory.createLoweredBevelBorder());
        
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
                // Son pareja - efecto de victoria
                revealed[firstRow][firstCol] = true;
                revealed[secondRow][secondCol] = true;
                pairsFound++;
                scoreLabel.setText("Parejas: " + pairsFound + "/" + totalPairs);
                
                // Efecto visual para parejas encontradas
                cards[firstRow][firstCol].setBackground(new Color(144, 238, 144));
                cards[secondRow][secondCol].setBackground(new Color(144, 238, 144));
                
                // Verificar si el nivel terminó
                if (pairsFound == totalPairs) {
                    levelCompleted();
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
                timer = new javax.swing.Timer(1500, e -> {
                    cards[firstRow][firstCol].setText("?");
                    cards[firstRow][firstCol].setBackground(new Color(200, 200, 200));
                    cards[firstRow][firstCol].setBorder(BorderFactory.createRaisedBevelBorder());
                    cards[secondRow][secondCol].setText("?");
                    cards[secondRow][secondCol].setBackground(new Color(200, 200, 200));
                    cards[secondRow][secondCol].setBorder(BorderFactory.createRaisedBevelBorder());
                    
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
    
    private void levelCompleted() {
        gameStarted = false;
        gameTimer.stop();
        
        String[] themeNames = {"Animales", "Frutas", "Deportes", "Naturaleza", "Vehículos"};
        
        JOptionPane.showMessageDialog(this, 
            "¡Nivel " + level + " completado!\n" +
            "Tema: " + themeNames[currentTheme] + "\n" +
            "Movimientos: " + moves + "\n" +
            "Tiempo: " + formatTime(timeElapsed),
            "¡Nivel Completado!", 
            JOptionPane.INFORMATION_MESSAGE);
    }
    
    private void nextLevel() {
        level++;
        levelLabel.setText("Nivel: " + level);
        newGame();
    }
    
    private void changeTheme() {
        currentTheme = (currentTheme + 1) % cardThemes.length;
        String[] themeNames = {"Animales", "Frutas", "Deportes", "Naturaleza", "Vehículos"};
        JOptionPane.showMessageDialog(this, 
            "Tema cambiado a: " + themeNames[currentTheme],
            "Cambio de Tema", 
            JOptionPane.INFORMATION_MESSAGE);
        resetGame();
    }
    
    private void startGameTimer() {
        gameTimer = new javax.swing.Timer(1000, e -> {
            if (gameStarted) {
                timeElapsed++;
                timeLabel.setText("Tiempo: " + formatTime(timeElapsed));
            }
        });
        gameTimer.start();
    }
    
    private String formatTime(int seconds) {
        int minutes = seconds / 60;
        int secs = seconds % 60;
        return String.format("%02d:%02d", minutes, secs);
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
                cards[i][j].setBackground(new Color(200, 200, 200));
                cards[i][j].setBorder(BorderFactory.createRaisedBevelBorder());
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
        timeElapsed = 0;
        gameStarted = false;
        
        // Actualizar labels
        scoreLabel.setText("Parejas: 0/" + totalPairs);
        movesLabel.setText("Movimientos: 0");
        timeLabel.setText("Tiempo: 00:00");
        
        // Detener timer si está activo
        if (timer != null && timer.isRunning()) {
            timer.stop();
        }
    }
    
    public static void main(String[] args) {
        // Ejecutar en el EDT (Event Dispatch Thread)
        SwingUtilities.invokeLater(() -> {
            new MemoryGameEnhanced().setVisible(true);
        });
    }
} 