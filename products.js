/* =========================================================
   CATÁLOGO CRONOS GRIFE — edite aqui preços, fotos e tamanhos
   ---------------------------------------------------------
   cat:   kits | camisetas | polos | bermudas | calcas | bones | perfumes
   price: número (ex.: 99.9) — use null para "sob consulta"
   old:   preço antigo riscado (opcional)
   ig:    true = produto/preço publicado no Instagram @cronosgrife
   Fotos dos itens sem "ig" são ilustrativas (Unsplash): troque
   pelas fotos reais das peças assim que tiver.
   ========================================================= */
const WA_NUMBER = '5565981443446';

const CATEGORIES = [
  { id: 'kits',      label: 'Kits',      img: 'media/DgLQLizhjXd.jpg' },
  { id: 'camisetas', label: 'Camisetas', img: 'media/shop/tee-black-2.jpg' },
  { id: 'polos',     label: 'Polos',     img: 'media/shop/polo-2.jpg' },
  { id: 'bermudas',  label: 'Bermudas',  img: 'media/shop/shorts-3.jpg' },
  { id: 'calcas',    label: 'Calças',    img: 'media/shop/jeans-1.jpg' },
  { id: 'bones',     label: 'Bonés',     img: 'media/shop/cap-2.jpg' },
  { id: 'perfumes',  label: 'Perfumes',  img: 'media/shop/perfume-4.jpg' },
];

const ROUPA = ['P', 'M', 'G', 'GG'];
const CALCA = ['38', '40', '42', '44', '46'];

const PRODUCTS = [
  // ---------- KITS (Instagram) ----------
  { id: 'kit-camiseta-bermuda', cat: 'kits', name: 'Kit Camiseta + Bermuda', price: 99.9, old: 240, ig: true, badge: 'Mais vendido',
    video: 'media/Dfc-owkR-eT.mp4', img: 'media/Dfc-owkR-eT.jpg', sizes: ROUPA,
    desc: 'Calção importado + t-shirt importada. O kit completo que custava R$ 240 sai por R$ 99,90.' },
  { id: 'kit-monte-150', cat: 'kits', name: 'Monte seu Kit', price: 150, ig: true, badge: 'Monte o seu',
    video: 'media/DgLQLizhjXd.mp4', img: 'media/DgLQLizhjXd.jpg', sizes: ROUPA,
    desc: 'Escolha suas peças e monte o kit do seu jeito: polos, camisetas, bermudas e calças.' },
  { id: 'kit-final-ano', cat: 'kits', name: 'Kit Final de Ano', price: null, ig: true, badge: 'Fim de ano',
    video: 'media/DgK0A_WRpFT.mp4', img: 'media/DgK0A_WRpFT.jpg', sizes: ROUPA,
    desc: 'Feche o ano no estilo. Monte seu kit para as festas com a ajuda da nossa equipe.' },

  // ---------- CAMISETAS ----------
  { id: 'cam-oversized-preta', cat: 'camisetas', name: 'Camiseta Oversized Preta', price: 59.9, img: 'media/shop/tee-black-2.jpg', sizes: ROUPA, badge: 'Novo',
    desc: 'Modelagem ampla, algodão encorpado e caimento streetwear.' },
  { id: 'cam-basica-preta', cat: 'camisetas', name: 'Camiseta Básica Premium Preta', price: 49.9, img: 'media/shop/tee-black-3.jpg', sizes: ROUPA,
    desc: 'A peça coringa do guarda-roupa: malha macia que não desbota.' },
  { id: 'cam-friso', cat: 'camisetas', name: 'Camiseta Friso Contraste', price: 69.9, img: 'media/shop/tee-black-1.jpg', sizes: ROUPA,
    desc: 'Detalhe de friso nas costuras para um visual diferenciado.' },
  { id: 'cam-longline', cat: 'camisetas', name: 'Camiseta Longline Preta', price: 64.9, img: 'media/shop/tee-black-4.jpg', sizes: ROUPA,
    desc: 'Comprimento alongado e barra arredondada.' },
  { id: 'cam-branca-essential', cat: 'camisetas', name: 'Camiseta Branca Essential', price: 49.9, img: 'media/shop/tee-white-2.jpg', sizes: ROUPA,
    desc: 'Branca de verdade, gola firme e tecido leve para o calor de Cuiabá.' },
  { id: 'cam-branca-pima', cat: 'camisetas', name: 'Camiseta Branca Algodão Pima', price: 59.9, img: 'media/shop/tee-white-3.jpg', sizes: ROUPA,
    desc: 'Toque sedoso e acabamento premium.' },

  // ---------- POLOS ----------
  { id: 'polo-malha-chinesa', cat: 'polos', name: 'Polo Malha Chinesa Premium', price: 75, ig: true, badge: 'Oferta', img: 'media/shop/polo-1.jpg', sizes: ['M', 'G', 'GG'],
    desc: 'Tecido leve, fresco e confortável. Elegância para qualquer ocasião e ideal para o calor de Cuiabá.' },
  { id: 'polo-piquet-preta', cat: 'polos', name: 'Polo Piquet Preta', price: 89.9, img: 'media/shop/polo-2.jpg', sizes: ROUPA,
    desc: 'Piquet clássico com caimento slim.' },
  { id: 'polo-mescla', cat: 'polos', name: 'Polo Piquet Mescla', price: 89.9, img: 'media/shop/polo-4.jpg', sizes: ROUPA,
    desc: 'Tom mescla versátil para o dia a dia.' },
  { id: 'polo-marinho', cat: 'polos', name: 'Polo Marinho Clássica', price: 89.9, img: 'media/shop/polo-5.jpg', sizes: ROUPA,
    desc: 'Azul-marinho com frisos na gola e na manga.' },
  { id: 'kit-3-polos', cat: 'polos', name: 'Kit 3 Polos Lisas', price: 229.9, old: 269.7, badge: 'Kit', img: 'media/shop/polo-3.jpg', sizes: ROUPA,
    desc: 'Três polos em cores neutras com desconto de kit.' },

  // ---------- BERMUDAS ----------
  { id: 'berm-sarja', cat: 'bermudas', name: 'Bermuda Sarja Off-White', price: 79.9, img: 'media/shop/shorts-1.jpg', sizes: CALCA,
    desc: 'Sarja com elastano, conforto o dia inteiro.' },
  { id: 'berm-dry', cat: 'bermudas', name: 'Bermuda Dry Fit Vinho', price: 59.9, img: 'media/shop/shorts-2.jpg', sizes: ROUPA,
    desc: 'Tecido leve de secagem rápida.' },
  { id: 'berm-linho', cat: 'bermudas', name: 'Bermuda Linho Branca', price: 89.9, img: 'media/shop/shorts-3.jpg', sizes: CALCA,
    desc: 'Linho fresquinho para o verão cuiabano.' },

  // ---------- CALÇAS ----------
  { id: 'calca-slim-azul', cat: 'calcas', name: 'Calça Jeans Slim Azul', price: 139.9, img: 'media/shop/jeans-1.jpg', sizes: CALCA,
    desc: 'Lavagem média, elastano e corte slim.' },
  { id: 'calca-skinny-preta', cat: 'calcas', name: 'Calça Jeans Skinny Preta', price: 149.9, img: 'media/shop/jeans-2.jpg', sizes: CALCA,
    desc: 'Preta intensa, ajustada sem apertar.' },
  { id: 'calca-reta-black', cat: 'calcas', name: 'Calça Jeans Reta Black', price: 149.9, img: 'media/shop/jeans-3.jpg', sizes: CALCA,
    desc: 'Corte reto com barra italiana.' },

  // ---------- BONÉS ----------
  { id: 'bone-dad-branco', cat: 'bones', name: 'Boné Dad Hat Branco', price: 59.9, img: 'media/shop/cap-1.jpg', sizes: ['Único'],
    desc: 'Aba curva e regulagem traseira.' },
  { id: 'bone-estonado', cat: 'bones', name: 'Boné Estonado Grafite', price: 69.9, img: 'media/shop/cap-2.jpg', sizes: ['Único'],
    desc: 'Lavagem estonada com visual vintage.' },

  // ---------- PERFUMES ----------
  { id: 'perf-ambar-noir', cat: 'perfumes', name: 'Âmbar Noir', sub: 'Eau de Parfum · 100 ml', price: 189.9, badge: 'Destaque', img: 'media/shop/perfume-4.jpg', sizes: ['100 ml'],
    notes: ['Âmbar', 'Baunilha', 'Couro'], desc: 'Amadeirado oriental, marcante e sofisticado para a noite.' },
  { id: 'perf-oud-royal', cat: 'perfumes', name: 'Oud Royal', sub: 'Eau de Parfum · 100 ml', price: 219.9, img: 'media/shop/perfume-8.jpg', sizes: ['100 ml'],
    notes: ['Oud', 'Rosa', 'Açafrão'], desc: 'Inspiração árabe intensa, com fixação de longa duração.' },
  { id: 'perf-madeira-nobre', cat: 'perfumes', name: 'Madeira Nobre', sub: 'Eau de Parfum · 100 ml', price: 179.9, img: 'media/shop/perfume-5.jpg', sizes: ['100 ml'],
    notes: ['Cedro', 'Vetiver', 'Pimenta'], desc: 'Amadeirado seco e elegante para o dia a dia.' },
  { id: 'perf-cristal-fresh', cat: 'perfumes', name: 'Cristal Fresh', sub: 'Eau de Toilette · 100 ml', price: 129.9, img: 'media/shop/perfume-6.jpg', sizes: ['100 ml'],
    notes: ['Bergamota', 'Menta', 'Almíscar'], desc: 'Cítrico refrescante, perfeito para o calor.' },
  { id: 'perf-black-cap', cat: 'perfumes', name: 'Black Edition', sub: 'Eau de Parfum · 100 ml', price: 169.9, img: 'media/shop/perfume-3.jpg', sizes: ['100 ml'],
    notes: ['Lavanda', 'Tonka', 'Patchouli'], desc: 'Aromático e moderno, assinatura de presença.' },
  { id: 'perf-aqua', cat: 'perfumes', name: 'Aqua Night', sub: 'Eau de Toilette · 100 ml', price: 139.9, img: 'media/shop/perfume-1.jpg', sizes: ['100 ml'],
    notes: ['Notas marinhas', 'Gengibre', 'Musgo'], desc: 'Aquático e noturno, leve sem perder a força.' },
  { id: 'perf-silver', cat: 'perfumes', name: 'Silver Sport', sub: 'Eau de Toilette · 100 ml', price: 129.9, img: 'media/shop/perfume-2.jpg', sizes: ['100 ml'],
    notes: ['Limão', 'Gerânio', 'Cedro'], desc: 'Esportivo e energético para o treino e o trabalho.' },
  { id: 'perf-pedra', cat: 'perfumes', name: 'Pedra & Musgo', sub: 'Eau de Parfum · 100 ml', price: 159.9, img: 'media/shop/perfume-7.jpg', sizes: ['100 ml'],
    notes: ['Musgo', 'Íris', 'Ambroxan'], desc: 'Mineral e limpo, discreto e muito elegante.' },
];
