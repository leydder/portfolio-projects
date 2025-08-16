package gm.zona_fit.servicio;

import ch.qos.logback.core.net.server.Client;
import gm.zona_fit.modelo.Cliente;

import java.util.List;

public interface IClienteServicio {
    public List<Cliente> listarClientes();

    public Cliente buscarClientePorId(Integer idCliente);

    public  void  guardarCliente(Cliente cliente);

    public void eliminarCliente(Cliente cliente);



}
