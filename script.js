document.addEventListener('DOMContentLoaded', () => {

    // ── Elements ──
    const chatForm        = document.getElementById('chat-form');
    const userInput       = document.getElementById('user-input');
    const chatMessages    = document.getElementById('chat-messages');
    const segmentSelector = document.getElementById('segment-selector');
    const chatContainer   = document.getElementById('chat-container');
    const segmentCards    = document.querySelectorAll('.segment-card');
    const agentTitle      = document.getElementById('agent-title');
    const segmentBadge    = document.getElementById('segment-badge');
    const chipsArea       = document.getElementById('chips-area');
    const leadModal       = document.getElementById('lead-modal');
    const leadOverlay     = document.getElementById('lead-overlay');
    const leadForm        = document.getElementById('lead-form');
    const leadSkip        = document.getElementById('lead-skip');

    const N8N_BASE = "https://automacoes-verbo-n8n.xpddsl.easypanel.host/webhook";

    // ── State ──
    let currentSegment = null;
    let pendingSegmentKey = null;
    let chipsActive = true;
    let agentReplyCount = 0;
    let sessionId = null;
    let isProcessing = false;

    // ── Segment Data ──
    const segmentData = {
        barbearia: {
            title: 'Assistente de Agendamento',
            badge: '✂️ Barbearia',
            webhookUrl: `${N8N_BASE}/agente-salao`,
            initialMessage: 'Olá! Sou o assistente de atendimento da <strong>Agência Verbo</strong> para Barbearias e Salões. Agendo horários, confirmo reservas e reduzo faltas automaticamente, 24h por dia. Como posso ajudar?',
            chips: ['Qual o valor do corte?', 'Tem horário para hoje?', 'Onde vocês ficam?']
        },
        advocacia: {
            title: 'Assistente Jurídico',
            badge: '⚖️ Advocacia',
            webhookUrl: `${N8N_BASE}/agente-advocacia`,
            initialMessage: 'Olá! Sou o assistente de atendimento da <strong>Agência Verbo</strong> para Escritórios de Advocacia. Qualifico clientes, agendar consultas e triagem de casos de forma inteligente, liberando o seu time para o que importa. Como posso ajudar?',
            chips: ['Qual o valor da consulta?', 'Atendem direito de família?', 'Onde fica o escritório?']
        },
        clinica: {
            title: 'Assistente Clínico',
            badge: '🩺 Clínica',
            webhookUrl: `${N8N_BASE}/agente-clinica`,
            initialMessage: 'Olá! Sou o assistente de atendimento da <strong>Agência Verbo</strong> para Clínicas. Agendo consultas, reduzo faltas e tiro dúvidas dos seus pacientes de forma automática. Como posso ajudar?',
            chips: ['Quais especialidades atendem?', 'Aceitam plano de saúde?', 'Qual o valor da consulta?']
        },
        energia_solar: {
            title: 'Assistente Solar',
            badge: '☀️ Energia Solar',
            webhookUrl: `${N8N_BASE}/agente-energia-solar`,
            initialMessage: 'Olá! Sou o assistente de captação da <strong>Agência Verbo</strong> para Energia Solar. Qualificando leads, apresentando propostas e agendando visitas técnicas automaticamente. Vamos escalar suas vendas?',
            chips: ['Qual o valor da instalação?', 'Quanto tempo pra instalar?', 'Em quanto tempo se paga?']
        },
        restaurante: {
            title: 'Assistente Delivery',
            badge: '🍔 Delivery',
            webhookUrl: `${N8N_BASE}/agente-restaurante`,
            initialMessage: 'Olá! Sou o assistente de atendimento da <strong>Agência Verbo</strong> para Food Service. Anoto pedidos, faço upselling e atendo seus clientes direto no WhatsApp, sem depender do iFood. Pronto para explodir suas vendas?',
            chips: ['Qual o cardápio de hoje?', 'Fazem entrega na minha rua?', 'Qual a taxa de entrega?']
        },
        agencia_vendas: {
            title: 'Assistente B2B',
            badge: '🚀 Agência',
            webhookUrl: `${N8N_BASE}/agente-agencia-marketing`,
            initialMessage: 'Olá! Sou o assistente de captação B2B da <strong>Agência Verbo</strong>. Qualificação de leads automática, agendamento de reuniões e CRM integrado. Qual desafio vamos resolver hoje?',
            chips: ['Quais serviços vocês oferecem?', 'Como funciona o processo?', 'Qual o prazo para ter resultados?']
        },
        agencia_consultoria: {
            title: 'Consultor de Marketing',
            badge: '📊 Agência',
            webhookUrl: `${N8N_BASE}/consultor-marketing`,
            initialMessage: 'Olá! Sou o especialista em marketing digital da sua agência. Tenho acesso exclusivo ao seu plano de crescimento para tirar dúvidas sobre tráfego, funis e posicionamento. Como posso alavancar seus resultados hoje?',
            chips: ['Meus anúncios estão ruins, o que pode ser?', 'Como interpretar o relatório do Meta Ads?', 'Por que meu custo por resultado subiu esse mês?']
        },
        boutique: {
            title: 'Personal Stylist',
            badge: '👗 Boutique',
            webhookUrl: `${N8N_BASE}/consultor-moda`,
            initialMessage: 'Olá! Sou o seu consultor de estilo e personal stylist exclusivo. Estou aqui para te dar dicas de moda personalizadas, tirar dúvidas sobre combinações e te ajudar a montar looks perfeitos para qualquer ocasião. Como posso te inspirar hoje?',
            chips: ['Como combinar uma calça de alfaiataria?', 'Que look usar em um jantar de negócios?', 'Quais cores valorizam meu tom de pele?']
        },
        academia: {
            title: 'Treinador Exclusivo',
            badge: '🏋️ Academia',
            webhookUrl: `${N8N_BASE}/consultor-personal`,
            initialMessage: 'Olá! Sou o seu treinador e consultor fitness exclusivo. Estou aqui para estruturar seus treinos, tirar dúvidas sobre execução de exercícios e te orientar sobre nutrição e performance. Pronto para evoluir hoje?',
            chips: ['Pode montar uma divisão de treino de hipertrofia?', 'O que comer no pré e pós-treino para ter energia?', 'Como executar o agachamento de forma segura?']
        },
        triagem: {
            title: 'Assistente de Saúde',
            badge: '🏥 Hospital',
            webhookUrl: `${N8N_BASE}/consultor-triagem`,
            initialMessage: 'Olá! Sou o seu assistente de saúde e triagem digital. Estou aqui para te dar orientações rápidas sobre sintomas, esclarecer dúvidas médicas básicas e te ajudar a identificar se o seu caso precisa de atendimento urgente. O que está sentindo?',
            chips: ['Preciso marcar uma consulta com urgência', 'Estou com febre há 2 dias, o que devo fazer?', 'Qual especialista devo procurar para dor nas costas?']
        }
    };

    // ── Agent Type Tabs ──
    const typeTabs = document.querySelectorAll('.type-tab');
    const segmentGroups = document.querySelectorAll('.segment-group');

    typeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            typeTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const type = tab.dataset.type;
            segmentGroups.forEach(group => {
                if (group.id === `group-${type}`) group.classList.remove('hidden');
                else group.classList.add('hidden');
            });
        });
    });

    // ── Testimonials carousel ──
    const cards = document.querySelectorAll('.testimonial-card');
    const dots  = document.querySelectorAll('.dot');
    let currentTestimonial = 0;
    let testimonialInterval;

    function goToTestimonial(idx) {
        cards[currentTestimonial].classList.remove('active');
        dots[currentTestimonial].classList.remove('active');
        currentTestimonial = idx;
        cards[currentTestimonial].classList.add('active');
        dots[currentTestimonial].classList.add('active');
    }

    function startTestimonials() {
        testimonialInterval = setInterval(() => {
            goToTestimonial((currentTestimonial + 1) % cards.length);
        }, 4000);
    }

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            clearInterval(testimonialInterval);
            goToTestimonial(parseInt(dot.dataset.idx));
            startTestimonials();
        });
    });
    startTestimonials();

    // ── Lead Modal ──
    function openLeadModal(segmentKey) {
        pendingSegmentKey = segmentKey;
        leadModal.classList.remove('hidden');
    }

    function closeModalAndOpenChat() {
        leadModal.classList.add('hidden');
        openChat(pendingSegmentKey);
    }

    segmentCards.forEach(card => {
        card.addEventListener('click', () => {
            openLeadModal(card.getAttribute('data-segment'));
        });
    });

    leadOverlay.addEventListener('click', closeModalAndOpenChat);
    leadSkip.addEventListener('click', closeModalAndOpenChat);

    leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name  = document.getElementById('lead-name').value.trim();
        const phone = document.getElementById('lead-phone').value.trim();
        // Lead capturado — pode integrar webhook dedicado futuramente
        if (name || phone) { console.log('Lead:', { name, phone, segment: pendingSegmentKey }); }
        closeModalAndOpenChat();
    });

    // ── Open Chat ──
    function openChat(segmentKey) {
        currentSegment = segmentData[segmentKey];
        agentTitle.textContent = currentSegment.title;
        segmentBadge.textContent = currentSegment.badge;
        segmentSelector.classList.add('hidden');
        chatContainer.classList.remove('hidden');
        document.querySelector('.hero-section').classList.add('chat-mode');
        document.querySelector('.right-col').classList.add('chat-mode-right');
        chipsActive = true;
        agentReplyCount = 0;
        sessionId = 'demo-' + Math.random().toString(36).slice(2, 10);

        // Render chips
        chipsArea.innerHTML = '';
        currentSegment.chips.forEach(text => {
            const btn = document.createElement('button');
            btn.className = 'chip';
            btn.textContent = text;
            btn.addEventListener('click', () => {
                sendMessage(text);
            });
            chipsArea.appendChild(btn);
        });
        chipsArea.classList.remove('hidden');

        // Feature 4: typing animation before initial message
        showTypingIndicator();
        setTimeout(() => {
            removeTypingIndicator();
            addMessage(currentSegment.initialMessage, false);
        }, 1600);
    }

    // ── Back Button ──
    document.getElementById('back-btn').addEventListener('click', () => {
        chatContainer.classList.add('hidden');
        segmentSelector.classList.remove('hidden');
        document.querySelector('.hero-section').classList.remove('chat-mode');
        document.querySelector('.right-col').classList.remove('chat-mode-right');
        chatMessages.innerHTML = '';
        chipsArea.innerHTML = '';
        chipsArea.classList.add('hidden');
        currentSegment = null;
        setProcessing(false);
    });

    // ── Send Message ──
    function setProcessing(active) {
        isProcessing = active;
        userInput.disabled = active;
        document.getElementById('send-btn').disabled = active;
        userInput.placeholder = active ? 'Aguarde a resposta...' : 'Digite sua mensagem aqui...';
    }

    function sendMessage(text) {
        if (!text.trim() || isProcessing) return;
        addMessage(text, true);
        userInput.value = '';

        if (chipsActive) {
            chipsArea.classList.add('hidden');
            chipsActive = false;
        }

        setProcessing(true);
        showTypingIndicator();

        fetch(currentSegment.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, chatInput: text })
        })
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
        .then(data => {
            removeTypingIndicator();
            const reply = data.reply || data.output || data.text || data.message || 'Mensagem recebida!';
            addMessage(reply, false);
            agentReplyCount++;
            if (agentReplyCount >= 2) showPostChatCTA();
        })
        .catch(() => {
            removeTypingIndicator();
            addMessage('<em style="opacity:0.7">(Agente indisponível no momento. Tente novamente.)</em>', false);
        })
        .finally(() => {
            setProcessing(false);
            userInput.focus();
        });
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage(userInput.value);
    });

    // ── Helpers ──
    function showPostChatCTA() {
        if (document.querySelector('.post-chat-cta')) return;
        const cta = document.createElement('div');
        cta.className = 'message agent-message post-chat-cta';
        cta.innerHTML = `
            <p>Gostou do que viu? Fale com a Verbo e tenha o seu agente funcionando em dias.</p>
            <a href="https://wa.me/5522997650140?text=Ol%C3%A1%21+Testei+o+agente+e+quero+saber+mais%21" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Falar com a Verbo
            </a>
        `;
        chatMessages.appendChild(cta);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // ── Markdown Parser ──
    function parseMarkdown(text) {
        // Escape HTML to prevent XSS (preserve existing safe tags from initialMessages)
        const allowedTags = /<\/?strong>/gi;
        const savedTags = [];
        text = text.replace(allowedTags, (match) => {
            savedTags.push(match);
            return `\x00SAVED${savedTags.length - 1}\x00`;
        });
        text = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        // Restore saved tags
        text = text.replace(/\x00SAVED(\d+)\x00/g, (_, i) => savedTags[parseInt(i)]);

        // Headers: ### ## #
        text = text.replace(/^### (.+)$/gm, '<h4 class="md-h4">$1</h4>');
        text = text.replace(/^## (.+)$/gm,  '<h3 class="md-h3">$1</h3>');
        text = text.replace(/^# (.+)$/gm,   '<h2 class="md-h2">$1</h2>');

        // Bold and italic
        text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.+?)\*/g,     '<em>$1</em>');

        // Inline code
        text = text.replace(/`(.+?)`/g, '<code class="md-code">$1</code>');

        // Bullet lists (- item or * item)
        text = text.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
        text = text.replace(/(<li>[\s\S]*?<\/li>)/g, (block) => `<ul class="md-ul">${block}</ul>`);
        // Collapse consecutive </ul><ul> 
        text = text.replace(/<\/ul>\s*<ul class="md-ul">/g, '');

        // Numbered lists
        text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        text = text.replace(/(<li>[\s\S]*?<\/li>)/g, (block) => {
            if (block.startsWith('<ul')) return block;
            return `<ol class="md-ol">${block}</ol>`;
        });
        text = text.replace(/<\/ol>\s*<ol class="md-ol">/g, '');

        // Line breaks: double newline = paragraph break, single newline = <br>
        text = text.replace(/\n\n/g, '</p><p class="md-p">');
        text = text.replace(/\n/g, '<br>');
        text = `<p class="md-p">${text}</p>`;

        // Clean up: don't wrap block elements inside <p>
        text = text.replace(/<p class="md-p">(<h[2-4]|<ul|<ol)/g, '$1');
        text = text.replace(/(<\/h[2-4]>|<\/ul>|<\/ol>)<\/p>/g, '$1');
        text = text.replace(/<p class="md-p"><\/p>/g, '');

        return text;
    }

    function addMessage(text, isUser = false) {
        const wrap = document.createElement('div');
        wrap.className = `message ${isUser ? 'user-message' : 'agent-message'}`;

        const content = document.createElement('div');
        content.className = 'message-content';
        if (isUser) content.textContent = text;
        else content.innerHTML = parseMarkdown(text);

        const time = document.createElement('div');
        time.className = 'message-time';
        const now = new Date();
        time.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

        wrap.appendChild(content);
        wrap.appendChild(time);
        chatMessages.appendChild(wrap);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const wrap = document.createElement('div');
        wrap.className = 'message agent-message';
        wrap.id = 'typing-indicator';
        const content = document.createElement('div');
        content.className = 'message-content typing-indicator';
        content.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        wrap.appendChild(content);
        chatMessages.appendChild(wrap);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const el = document.getElementById('typing-indicator');
        if (el) el.remove();
    }
});
