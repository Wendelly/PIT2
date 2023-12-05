// Em server.js

const express = require('express');
const app = express();
const db = require('./db'); // Importe o arquivo db.js
const path = require('path'); // Importe o módulo 'path'
const bodyParser = require('body-parser'); // Importe o body-parser
app.use(bodyParser.json());
const session = require('express-session');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: 'public/imagens/',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Configuração do express-session
app.use(session({
  secret: 'test4096', // substitua por uma string secreta de sua escolha
  resave: false,
  saveUninitialized: true
}));

app.use(express.static('public'));

// Configuração do body-parser
app.use(bodyParser.urlencoded({ extended: true }));


// Configuração das visualizações (views) e do mecanismo de visualização (view engine)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Rota para a página de login
app.get('/login', (req, res) => {
    res.render('login'); // Renderiza a página de login
});

// Rota para a pagina de Admin_1
app.get('/admin_1', (req, res) => {
    res.render('admin_1');
});

app.get('/admin_3', (req, res) => {
    res.render('admin_3');
});
app.get('/finish', (req, res) => {
    res.render('finish');
});

// Rota para renderizar a página de registro
app.get('/register', (req, res) => {
    res.render('register'); // Renderiza a página de registro
});

// Rota para processar o login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
  
    // Lógica para verificar as credenciais no banco de dados
    db.checkCredentials(email, senha, (err, user) => {
      if (err || !user) {
        res.status(401).send('Credenciais inválidas');
        return;
      }
      
      // Armazenar o usuário na sessão após autenticar
      req.session.user = user;
      
      // Se as credenciais estiverem corretas, redirecionar para a página de administração
      res.redirect('/'); 
    });
});

app.post('/end', (req, res) => {
  
    const nome = req.session.user.id;
    const name = req.session.carrinho;
    const totalPrice = req.session.carrinho;
  
    db.createOrder(nome,name, price, (err, results) => {
      if (err) {
        // Tratar erro aqui
        return res.status(500).send('Erro ao processar pedido');
      }
      // Pedido processado com sucesso, redirecionar para página de agradecimento ou similar
      res.redirect('end');
    });
});
  

app.get('/end', (req, res) => {
    if (req.session.user) {
      res.render('end'); // Note que aqui não há barra antes de 'end'
    } else {
      res.redirect('/login');
    }
  });
  

// Rota para processar o registro
app.post('/register', (req, res) => {
    const { nome, email, senha, local } = req.body;
  
    // Lógica para criar uma nova conta de usuário no banco de dados
    db.createUser(nome, email, senha, local, (err) => {
      if (err) {
        // Tratar o erro específico do banco de dados aqui
        console.error(err);
        res.status(500).send('Erro ao criar a conta de usuário');
        return;
      }
      // Redirecionar para a página de login após o registro bem-sucedido
      res.redirect('/login');
    });
});


// pedido
// app.get('/finalizar-pedido', (req, res) => {
//     if (!req.session.user) {
//       res.redirect('/login');
//     } else {
//       res.render('pagamento');
//     }
//   });

// Rota para renderizar a página inicial com os produtos
// Rota para renderizar a página inicial com os produtos
app.get('/', (req, res) => {
    db.getProducts((err, products) => {
        if (err) {
            res.status(500).send('Erro ao buscar produtos.');
            return;
        }
        // A linha abaixo garante que 'user' será um objeto vazio se não houver usuário logado
        const user = req.session.user || {};
        res.render('index', { user: user, products: products });
    });
});



// Rota para a página de administração
app.get('/admin_3', (req, res) => {
    db.getOrder((err, products) => {
        if (err) {
            // Tratar o erro adequadamente
            res.status(500).send('Erro ao buscar produtos');
        } else {
            // Passa tanto 'user' quanto 'products' para o template
            res.render('admin_3', { user: user, order: order });
        }
    });
});


// Configuração do diretório de views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// adicionar um produto 
app.post('/addProduct', upload.single('imagem'), (req, res) => {
    // Aqui você extrai os dados do produto do 'req.body' e o caminho do arquivo da imagem do 'req.file'
    let productData = {
        name: req.body.name,
        info: req.body.info,
        estoque: req.body.estoque,
        imagem: req.file ? req.file.path : null // ou algum caminho padrão
    };

    db.addProduct(productData, (err, result) => {
        if (err) {
            // Tratar erro
            return res.status(500).send("Erro ao adicionar produto.");
        }
        res.redirect('/admin_2');
    });
});

// Rota para admin_2
app.get('/admin_2', (req, res) => {
    db.getProducts((err, products) => {
        if (err) {
            return res.status(500).send("Erro ao buscar produtos.");
        }
        res.render('admin_2', { products });
    });
});


app.get('/itens-carrinho', (req, res) => {
    res.json(req.session.carrinho || {});
});

//adicionar carrinho 
app.post('/adicionar-carrinho', (req, res) => {
    const nomeProduto = req.body.nomeProduto; // Observe que mudei para 'nomeProduto'
    const quantidade = req.body.quantidade || 1;
  
    if (!req.session.carrinho) {
        req.session.carrinho = {};
    }
  
    if (req.session.carrinho[nomeProduto]) {
        req.session.carrinho[nomeProduto].quantidade += quantidade;
    } else {
        db.getProductByName(nomeProduto, (err, produto) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Erro ao buscar informações do produto." });
            }
            req.session.carrinho[nomeProduto] = { ...produto, quantidade: quantidade };
            res.json({ success: true });
        });
    }
});


// Remover carrinho 
app.post('/remover-carrinho', (req, res) => {
    const idProduto = req.body.idProduto;
  
    if (req.session.carrinho && req.session.carrinho[idProduto]) {
      delete req.session.carrinho[idProduto];
    }
  
    res.json({ success: true });
  });

  
// ... Outras rotas e configurações do servidor ...

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
