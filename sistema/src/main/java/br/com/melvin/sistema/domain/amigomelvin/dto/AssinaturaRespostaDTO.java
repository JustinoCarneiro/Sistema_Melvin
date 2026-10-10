package br.com.melvin.sistema.domain.amigomelvin.dto;

/**
 * Resposta PÚBLICA de POST /amigomelvin/subscribe. Só o que o site precisa: o clientSecret para confirmar o
 * primeiro pagamento (3D Secure) numa assinatura nova, ou o aviso de que o valor de uma assinatura existente
 * foi atualizado. Devolver o cadastro inteiro entregaria CPF, telefone, e-mail e ids do Stripe a quem só sabe o
 * e-mail ou o CPF de um doador.
 */
public record AssinaturaRespostaDTO(String clientSecret, boolean atualizada) {
}
