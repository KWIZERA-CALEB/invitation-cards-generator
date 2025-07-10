from datasets import load_dataset, Dataset
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer, AutoModelForSeq2SeqLM
from peft import get_peft_model, LoraConfig, TaskType, PeftModel
import torch

import pandas as pd
from datasets import Dataset
from transformers import (
    AutoTokenizer, AutoModelForSeq2SeqLM,
    Trainer, TrainingArguments, DataCollatorForSeq2Seq
)
import torch

# 1. Load data
df = pd.read_json("create_card.jsonl", lines=True)
train_data = Dataset.from_pandas(df)

# 2. Load tokenizer & model
model_name = "google/flan-t5-small"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# 3. Preprocessing function
prefix = "Generate a card layout in JSON format: "

def preprocess(batch):
    inputs = [prefix + p for p in batch["prompt"]]
    model_inputs = tokenizer(inputs, max_length=256, padding="max_length", truncation=True)

    with tokenizer.as_target_tokenizer():
        targets = tokenizer(
            batch["completion"], max_length=512, padding="max_length", truncation=True
        )

    labels = [
        [(t if t != tokenizer.pad_token_id else -100) for t in target]
        for target in targets["input_ids"]
    ]

    model_inputs["labels"] = labels
    return model_inputs


# 4. Map preprocessing
tokenized_data = train_data.map(preprocess, batched=True, remove_columns=["prompt", "completion"])

# 🚫 DO NOT CAST OR SET FORMAT — causes numpy copy error

# 5. TrainingArguments
training_args = TrainingArguments(
    output_dir="./flan-t5-finetuned",
    per_device_train_batch_size=4,
    num_train_epochs=3,
    save_total_limit=1,
    fp16=torch.cuda.is_available(),
    logging_dir="./logs",
    logging_steps=10,
    save_steps=100,
    remove_unused_columns=False,
)

# 6. Data collator
data_collator = DataCollatorForSeq2Seq(tokenizer, model=model)

# 7. Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_data,
    data_collator=data_collator,
)

# 8. Train
trainer.train()

# 9. Save
model.save_pretrained("./flan-t5-cardgen")
tokenizer.save_pretrained("./flan-t5-cardgen")


model_path = "./flan-t5-cardgen"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSeq2SeqLM.from_pretrained(model_path)

def generate_design(prompt):
    inputs = tokenizer(prompt, return_tensors="pt", padding=True, truncation=True)
    output = model.generate(**inputs, max_length=512)
    decoded = tokenizer.decode(output[0], skip_special_tokens=True)
    return decoded