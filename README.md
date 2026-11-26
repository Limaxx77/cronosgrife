# Cronos Grife

Site-catálogo da **Cronos Grife**, loja de moda masculina e perfumaria no CPA 2, Av. Brasil, Cuiabá-MT.

- Loja online com carrinho; o pedido é finalizado pelo WhatsApp
- Categorias: kits, camisetas, polos, bermudas, calças, bonés e perfumes
- Vídeos do Instagram [@cronosgrife](https://www.instagram.com/cronosgrife/)
- Animações com [GSAP](https://gsap.com/) (carregado por CDN)

## Como rodar

É um site estático. Abra o `index.html` com o Live Server do VS Code (ou qualquer servidor local).
Pelo arquivo direto (`file://`), os vídeos incorporados do Instagram podem não carregar.

## Como editar produtos

Tudo fica em [`products.js`](products.js): nome, preço, preço antigo, foto, tamanhos e descrição.
Use `price: null` para "sob consulta". O número do WhatsApp está em `WA_NUMBER`.

## Créditos das imagens

As fotos em `media/shop/` são do [Unsplash](https://unsplash.com) (licença Unsplash, uso livre) e servem de ilustração.
As fotos e vídeos da loja em `media/` são do Instagram da Cronos Grife.
