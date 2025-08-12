package zona_fit.datos;

import zona_fit.dominio.Cliente;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import static zona_fit.conexion.Conexion.getConexion;

public class ClienteDAO implements IClienteDAO {

    // Método centralizado para loguear errores
    private void logError(String mensaje, Exception e) {
        System.err.println("[ERROR] " + mensaje);
        if (e != null) {
            e.printStackTrace();
        }
    }

    @Override
    public List<Cliente> listarClientes() {
        String sql = "SELECT * FROM cliente ORDER BY id";
        List<Cliente> clientes = new ArrayList<>();

        try (Connection con = getConexion();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                clientes.add(mapCliente(rs));
            }

        } catch (Exception e) {
            logError("Error al listar clientes", e);
        }
        return clientes;
    }

    @Override
    public boolean buscarClientePorId(Cliente cliente) {
        String sql = "SELECT * FROM cliente WHERE id = ?";

        try (Connection con = getConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, cliente.getId());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    cliente.setNombre(rs.getString("nombre"));
                    cliente.setApellido(rs.getString("apellido"));
                    cliente.setMembresia(rs.getInt("membresia"));
                    return true;
                }
            }

        } catch (Exception e) {
            logError("Error al buscar cliente con ID: " + cliente.getId(), e);
        }
        return false;
    }

    @Override
    public boolean agregarCliente(Cliente cliente) {
        String sql = "INSERT INTO cliente(nombre, apellido, membresia) VALUES (?, ?, ?)";

        try (Connection con = getConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, cliente.getNombre());
            ps.setString(2, cliente.getApellido());
            ps.setInt(3, cliente.getMembresia());

            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            logError("Error al agregar cliente: " + cliente, e);
        }
        return false;
    }

    @Override
    public boolean modificarCliente(Cliente cliente) {
        String sql = "UPDATE cliente SET nombre = ?, apellido = ?, membresia = ? WHERE id = ?";

        try (Connection con = getConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, cliente.getNombre());
            ps.setString(2, cliente.getApellido());
            ps.setInt(3, cliente.getMembresia());
            ps.setInt(4, cliente.getId());

            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            logError("Error al modificar cliente con ID: " + cliente.getId(), e);
        }
        return false;
    }

    @Override
    public boolean eliminarCliente(Cliente cliente) {
        String sql = "DELETE FROM cliente WHERE id = ?";

        try (Connection con = getConexion();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, cliente.getId());
            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            logError("Error al eliminar cliente con ID: " + cliente.getId(), e);
        }
        return false;
    }

    // Método para mapear un ResultSet a un objeto Cliente
    private Cliente mapCliente(ResultSet rs) throws Exception {
        Cliente cliente = new Cliente();
        cliente.setId(rs.getInt("id"));
        cliente.setNombre(rs.getString("nombre"));
        cliente.setApellido(rs.getString("apellido"));
        cliente.setMembresia(rs.getInt("membresia"));
        return cliente;
    }

}
