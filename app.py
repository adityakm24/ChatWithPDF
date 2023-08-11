import os
from flask import Flask, render_template, request
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
import openai  # Import the openai library

app = Flask(__name__)
qa_chain = None  # Initialize the qa_chain variable

# Set your OpenAI API key here
openai.api_key = 'YOUR_OPENAI_API_KEY'


def process_uploaded_file(uploaded_file):
    global qa_chain  # Use the global qa_chain variable

    file_path = os.path.join('docs', uploaded_file.filename)
    uploaded_file.save(file_path)

    loader = PyPDFLoader(file_path)
    documents = loader.load()

    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    documents = text_splitter.split_documents(documents)

    vectordb = Chroma.from_documents(
        documents,
        embedding=OpenAIEmbeddings(),
        persist_directory='./data'
    )
    vectordb.persist()

    qa_chain = RetrievalQA.from_chain_type(
        llm=None,  # You can set llm to None since you'll be using OpenAI's GPT model
        retriever=vectordb.as_retriever(search_kwargs={'k': 6}),
        return_source_documents=True
    )


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload_file():
    uploaded_file = request.files['file']
    if not uploaded_file:
        return render_template('index.html', error='Please choose a file to upload.')

    process_uploaded_file(uploaded_file)
    return render_template('index.html', success='File uploaded successfully.')


@app.route('/ask', methods=['POST'])
def ask_question():
    query = request.form.get('query')
    if not query:
        return render_template('index.html', error='Please enter a question.')

    # Use the OpenAI API to generate an answer
    response = openai.Completion.create(
        engine="davinci",  # Use the engine of your choice (davinci, curie, etc.)
        prompt=query,
        max_tokens=100  # Adjust the max_tokens based on your needs
    )

    answer = response.choices[0].text
    return render_template('index.html', query=query, answer=answer)


if __name__ == '__main__':
    app.run(debug=True)
