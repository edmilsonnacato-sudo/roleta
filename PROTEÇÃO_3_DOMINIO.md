# 🔒 PROTEÇÃO 3: RESTRINGIR CHAVE API POR DOMÍNIO

## 🎯 **O QUE FAZ:**
Configura sua chave API para funcionar **SOMENTE** no seu site da Vercel.  
Mesmo se alguém copiar a chave, **NÃO vai funcionar** em outro domínio.

---

## 📋 **PASSO A PASSO (5 minutos):**

### **1. Acessar Google Cloud Console**
```
https://console.cloud.google.com/apis/credentials
```

### **2. Fazer Login**
- Use a mesma conta Google que você usou para criar a chave API

### **3. Localizar Sua Chave API**
- Você verá uma lista de "API Keys"
- Procure pela chave que começa com: `AIzaSyD58RC-hD-1MdSQgdz0neZKhkwlNkiubJs`
- Clique no **ícone de lápis** (editar) ao lado dela

### **4. Configurar Restrições de Aplicação**

#### **Opção A: Application Restrictions (Recomendado)**
1. Encontre a seção: **Application restrictions**
2. Selecione: **HTTP referrers (web sites)**
3. Clique em **ADD AN ITEM**
4. Adicione seus domínios:
   ```
   https://seu-site.vercel.app/*
   https://*.vercel.app/*
   http://localhost:3000/*
   ```
   
   ⚠️ **Substitua** `seu-site` pelo nome realque você vai usar na Vercel!
   
5. Clique em **DONE**

#### **Explicação:**
- `https://seu-site.vercel.app/*` → Seu site principal
- `https://*.vercel.app/*` → Preview deploys da Vercel
- `http://localhost:3000/*` → Desenvolvimento local (opcional)

### **5. Configurar Restrições de API**

1. Encontre a seção: **API restrictions**
2. Selecione: **Restrict key**
3. Marque **APENAS**:
   - ✅ **Generative Language API**
4. Desmarque todo o resto
5. Clique em **SAVE** (no topo da página)

---

## ✅ **RESULTADO:**

Agora sua chave API:
- ✅ **Só funciona** no seu domínio da Vercel
- ✅ **Só funciona** com Gemini API (não outras APIs do Google)
- ❌ **NÃO funciona** se alguém copiar para outro site
- ❌ **NÃO funciona** em requisições diretas (curl, Postman, etc)

---

## 🧪 **TESTAR SE FUNCIONOU:**

### **Teste 1: No Seu Site (deve funcionar)**
1. Acesse: `https://seu-site.vercel.app`
2. Envie um print
3. Deve funcionar **normalmente** ✅

### **Teste 2: Copiar Chave (deve falhar)**
1. Abra DevTools (F12) → Network
2. Veja a requisição para `generativelanguage.googleapis.com`
3. Copie a URL completa (com a chave)
4. Cole em uma nova aba
5. Deve dar erro: **403 Forbidden** ❌

### **Teste 3: Outro Domínio (deve falhar)**
1. Se alguém copiar seu código e subir em outro domínio
2. A chave **NÃO vai funcionar** ❌
3. Erro: `API key not valid for the provided referrer`

---

## 🔄 **SE QUISER MUDAR DEPOIS:**

Sempre que mudar o domínio da Vercel:
1. Volte em: https://console.cloud.google.com/apis/credentials
2. Edite a chave
3. Atualize os HTTP referrers
4. Salve

---

## ⚠️ **ATENÇÃO:**

### **Durante Desenvolvimento Local:**
Se você restringiu por domínio, o `localhost` pode parar de funcionar.  
**Solução:** Adicione `http://localhost:3000/*` nos HTTP referrers.

### **Se Bloqueou Sem Querer:**
1. Volte nas configurações da chave
2. Mude para: **None** (sem restrições)
3. Salve
4. Teste se voltou a funcionar

---

## 📊 **RESUMO DA PROTEÇÃO:**

| Cenário | Funciona? |
|---------|-----------|
| **Seu site na Vercel** | ✅ SIM |
| **Localhost (dev)** | ✅ SIM (se configurado) |
| **Outro site qualquer** | ❌ NÃO |
| **Alguém copia a chave** | ❌ NÃO FUNCIONA |
| **Requisição direta (curl)** | ❌ NÃO |

---

## 🎉 **PRONTO!**

Sua chave agora está **100% protegida contra roubo**.  
Mesmo quem ver a chave no código **NÃO consegue usar**.

**Configure isso ANTES de compartilhar o link do site!** 🔒
