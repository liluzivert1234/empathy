import streamlit as st
from openai import OpenAI

st.set_page_config(page_title="mysterious chatbot", layout="wide")

with st.sidebar:
    st.markdown("### Settings")
    pre_prompt = st.text_area(
        "System Prompt",
        value="You are a helpful assistant",
        height=150
    )
    st.caption("You can modify the system prompt here.")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",
)

st.title("")

if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "system", "content": pre_prompt}
    ]
else:
    st.session_state.messages[0]["content"] = pre_prompt

chat_container = st.container()


st.markdown("""
<style>
/* Remove gray background of the user chat container */
.stChatMessageUser {
    background-color: transparent !important;
}

/* Remove padding so bubbles don’t stretch full width */
.stChatMessageUser .stMarkdown,
.stChatMessageAssistant .stMarkdown {
    background-color: transparent !important;
    padding: 0 !important;
}
</style>
""", unsafe_allow_html=True)



with chat_container:
    for msg in st.session_state.messages:
        if msg["role"] == "user":
            with st.chat_message("user", avatar="🧑"):
                st.markdown(
                    f"""
                    <div style="
                        display: inline-block;
                        background: #DCF8C6;
                        color: black;
                        padding: 10px 14px;
                        border-radius: 14px;
                        max-width: 60%;
                        margin-left: auto;
                        text-align: left;
                    ">
                        {msg['content']}
                    </div>
                    """,
                    unsafe_allow_html=True
                )

        elif msg["role"] == "assistant":
            with st.chat_message("assistant", avatar="🤖"):
                st.markdown(
                    f"""
                    <div style="
                        display: inline-block;
                        background: #F1F0F0;
                        color: black;
                        padding: 10px 14px;
                        border-radius: 14px;
                        max-width: 60%;
                        margin-right: auto;
                        text-align: left;
                    ">
                        {msg['content']}
                    </div>
                    """,
                    unsafe_allow_html=True
                )


user_input = st.chat_input("Type your message...")

if user_input:

    st.session_state.messages.append({"role": "user", "content": user_input})

    # Model call
    response = client.chat.completions.create(
        model="x-ai/grok-4.1-fast:free",
        messages=st.session_state.messages,
        extra_body={"reasoning": {"enabled": True}}
    )

    assistant_msg = response.choices[0].message
    content = assistant_msg.content

    # Save assistant message
    st.session_state.messages.append({
        "role": "assistant",
        "content": content,
        "reasoning_details": assistant_msg.reasoning_details
    })

    st.rerun()