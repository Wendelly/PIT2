// Em db.js

const mysql = require('mysql');

// Configuração da conexão
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '40962127',
  database: 'coffee'
});

// Conectar ao banco de dados
connection.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conexão ao banco de dados MariaDB estabelecida!');
});

function createUser(nome, email, senha, local, callback) {
    // Suponha que sua tabela de usuários tenha colunas email, senha e local
    const sql = 'INSERT INTO Usuarios (nome,email, senha, local) VALUES (?, ?, ?, ?)';
    
    connection.query(sql, [nome, email, senha, local], (err, results) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, results);
    });
}
  
function createOrder(nome,name, price, callback) {
    const sql = 'INSERT INTO `order` (nome,name, price) VALUES (?,?,?)';
    
    connection.query(sql, [nome,name, price], (err, results) => {
      if (err) {
        callback(err);
        return;
      }
      callback(null, results);
    });
}
// Função para buscar produtos
function getProducts(callback) {
  connection.query('SELECT * FROM product', (err, results) => {
    if (err) {
      callback(err, null);
      return;
    }
    callback(null, results);
  });
}

function getOrder(callback) {
    connection.query('SELECT * FROM order', (err, results) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, results);
    });
  }
  
// Função para adicionar um novo produto
function addProduct(productData, callback) {
    connection.query('INSERT INTO product (name, info, estoque, imagem) VALUES (?, ?, ?, ?)', 
    [productData.name, productData.info, productData.estoque, productData.imagem], (err, result) => {
      if (err) {
        callback(err, null);
        return;
      }
      callback(null, result);
    });
}

function mostrarCarrinho() {
    fetch('/itens-carrinho')
      .then(response => response.json())
      .then(carrinho => {
        let conteudoCarrinho = '';
        Object.keys(carrinho).forEach(idProduto => {
          conteudoCarrinho += '<p>' + carrinho[idProduto].nome + ' - Qt: ' + carrinho[idProduto].quantidade + '</p>';
        });
        document.getElementById('conteudoCarrinho').innerHTML = conteudoCarrinho;
      })
      .catch(error => console.error('Erro:', error));
}
  
// carrinho
function adicionarAoCarrinho(produtoId) {
    fetch('/adicionar-carrinho', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idProduto: produtoId, quantidade: 1 })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('Produto adicionado ao carrinho');
        // Atualizar o carrinho aqui se necessário
      }
    })
    .catch(error => console.error('Erro:', error));
}

  
// Função para verificar as credenciais
function checkCredentials(email, senha, callback) {
    connection.query('SELECT * FROM Usuarios WHERE email = ? AND senha = ?', [email, senha], (err, results) => {
      if (err || results.length === 0) {
        callback(err || 'Credenciais inválidas', null); // Retorna null se as credenciais forem inválidas
        return;
      }

      const user = {
        nome: results[0].nome,
        local: results[0].local,
        cod: results[0].cod,
        id: results[0].id
        // Adicione aqui os campos necessários do seu usuário
      };
      callback(null, user); // Retorna os dados do usuário se as credenciais forem válidas
    });
}

function getProductByName(nomeProduto, callback) {
    connection.query('SELECT * FROM product WHERE name = ?', [nomeProduto], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        if (results.length > 0) {
            console.log(results[0]); // Adicione esta linha para ver o resultado no console
            callback(null, results[0]);
        } else {
            callback('Produto não encontrado', null);
        }
    });
}

  
  
module.exports = { getProducts, getOrder,addProduct, checkCredentials,createOrder,getProductByName,adicionarAoCarrinho, createUser,mostrarCarrinho };
