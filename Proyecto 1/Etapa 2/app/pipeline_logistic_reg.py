import pandas as pd

import nltk
nltk.download('punkt')
nltk.download('punkt_tab')
nltk.download('stopwords')
nltk.download('wordnet')
nltk.download('omw-1.4')

import re
from nltk.corpus import stopwords
from nltk.corpus import stopwords
from sklearn.base import BaseEstimator, TransformerMixin

from sklearn.feature_extraction.text import TfidfVectorizer

import spacy

import dill

from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split


class DataCleaner(BaseEstimator, TransformerMixin):
    def __init__(self):
        self.stopwords = set(stopwords.words('spanish'))

    def clean_text(self, text):
        # Reemplazar caracteres especiales
        text = text.replace('Ã±', 'ñ')
        text = text.replace('Ã¡', 'á')
        text = text.replace('Ã©', 'é')
        text = text.replace('Ã­', 'í')
        text = text.replace('Ã³', 'ó')
        text = text.replace('Ãº', 'ú')
        text = text.replace('Ã', 'a')
        text = text.replace('Ã©', 'e')
        text = text.replace('Ã­', 'i')
        text = text.replace('Ã³', 'o')
        text = text.replace('Ãº', 'u')

        # Convertir a minúsculas
        text = text.lower()

        # Eliminar números
        import re
        text = re.sub(r'\d+', '', text)

        # Eliminar símbolos y puntuación, pero mantener caracteres válidos en español
        text = re.sub(r'[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]', '', text)

        # Eliminar espacios adicionales
        text = re.sub(r'\s+', ' ', text).strip()

        # Eliminar stopwords
        words = text.split()
        words = [word for word in words if word not in self.stopwords]

        # Reconstruir el texto
        text = ' '.join(words)

        return text

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        return X.apply(self.clean_text)
    

class Tokenizer(BaseEstimator, TransformerMixin):
    def __init__(self):
        import nltk
        self.stopwords = set(stopwords.words('spanish'))

    def tokenize(self, text):
        # Tokenizar el texto
        import nltk
        return nltk.word_tokenize(text)

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        # Eliminar filas con valores nulos en X
        X = X.dropna()

        # Tokenizar cada texto en la serie
        return X.apply(self.tokenize)
    
class Normalizer(BaseEstimator, TransformerMixin):
    def __init__(self):
        # Cargar el modelo de spaCy para español
        import spacy
        self.nlp = spacy.load('es_core_news_sm')
        import nltk
        self.stopwords = set(stopwords.words('spanish'))

    def lemmatize_tokens(self, tokens):
        doc = self.nlp(' '.join(tokens))
        lemmatized_tokens = []

        for token in doc:
            # Verificar si el lema tiene más de una palabra
            if len(token.lemma_.split()) > 1:
                # Dividir el lema en palabras individuales
                for word in token.lemma_.split():
                    # Añadir la palabra si no es una stopword
                    import nltk
                    if word not in self.stopwords:
                        lemmatized_tokens.append(word)
            else:
                lemmatized_tokens.append(token.lemma_)

        return lemmatized_tokens

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        # Aplica la lematización a cada lista de tokens en la serie
        return X.apply(lambda tokens: self.lemmatize_tokens(tokens))


opinions_df = pd.read_excel('ODScat_345.xlsx')

def identity_tokenizer(tokens):
    return tokens

def identity_preprocessor(text):
    return text


pipeline_logistic_reg = Pipeline([
    ('cleaner', DataCleaner()),        # Limpieza de datos
    ('tokenizer', Tokenizer()),        # Tokenización y eliminación de nulos
    ('normalizer', Normalizer()),      # Lematización de tokens
    ('tfidf', TfidfVectorizer(tokenizer=identity_tokenizer, preprocessor=identity_preprocessor)),  # Vectorización TF-IDF
    ('classifier', LogisticRegression(max_iter=300))  # Regresión logística
])

X = opinions_df['Textos_espanol']
y = opinions_df['sdg']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# entrenamiento
pipeline_logistic_reg.fit(X_train, y_train)

import dill
with open('pipeline_logistic_reg.pkl', 'wb') as f:
    dill.dump(pipeline_logistic_reg, f)