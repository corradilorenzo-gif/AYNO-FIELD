from pathlib import Path
p=Path('FormaAndroid/app/src/main/java/it/forma/app/ui/FormaScreens.kt')
s=p.read_text()
old='            FilterChip(selected = tab == 2, onClick = { tab = 2 }, label = { Text("Ricette") })'
assert old in s
s=s.replace(old,old+'\n            FilterChip(selected = tab == 3, onClick = { tab = 3 }, label = { Text("Fonti proteiche") })')
s=s.replace('            else -> {\n                WhiteCard {\n                    Text("Idee e ricette",','            2 -> {\n                WhiteCard {\n                    Text("Idee e ricette",',1)
old='                RecipeSection(store, suggestionDay)\n            }\n        }\n    }\n}\n\n@Composable\nprivate fun MealCard'
assert old in s
s=s.replace(old,'                RecipeSection(store, suggestionDay)\n            }\n            else -> ProteinTable()\n        }\n    }\n}\n\n@Composable\nprivate fun MealCard')
s=s.replace('Forma · versione 0.4.0 · Diario libero e suggerimenti separati','Forma · versione 0.4.1 · Diario libero e fonti proteiche')
s+='''
private data class ProteinItem(val name: String, val kind: String, val protein: Double, val kcal: Int, val grams: Int)
private val proteinExamples = listOf(
    ProteinItem("Pollo (crudo)", "Carne e pesce", 23.0, 110, 120),
    ProteinItem("Tacchino (crudo)", "Carne e pesce", 23.0, 110, 120),
    ProteinItem("Manzo magro (crudo)", "Carne e pesce", 21.0, 130, 130),
    ProteinItem("Salmone (crudo)", "Carne e pesce", 20.0, 208, 130),
    ProteinItem("Merluzzo (crudo)", "Carne e pesce", 18.0, 82, 150),
    ProteinItem("Tonno sgocciolato", "Carne e pesce", 25.0, 110, 90),
    ProteinItem("Uova senza guscio", "Latticini e uova", 12.6, 143, 110),
    ProteinItem("Skyr bianco", "Latticini e uova", 10.5, 63, 170),
    ProteinItem("Yogurt greco 0%", "Latticini e uova", 10.0, 59, 170),
    ProteinItem("Fiocchi di latte", "Latticini e uova", 11.5, 98, 150),
    ProteinItem("Ricotta", "Latticini e uova", 9.0, 146, 100),
    ProteinItem("Parmigiano", "Latticini e uova", 33.0, 392, 30),
    ProteinItem("Tofu naturale", "Legumi e vegetali", 12.0, 120, 150),
    ProteinItem("Tempeh", "Legumi e vegetali", 19.0, 193, 120),
    ProteinItem("Lenticchie cotte", "Legumi e vegetali", 9.0, 116, 160),
    ProteinItem("Ceci cotti", "Legumi e vegetali", 7.0, 120, 150),
    ProteinItem("Fagioli cotti", "Legumi e vegetali", 8.0, 110, 160),
    ProteinItem("Edamame cotto", "Legumi e vegetali", 12.0, 121, 150),
    ProteinItem("Avena secca", "Cereali e frutta secca", 13.0, 389, 40),
    ProteinItem("Mandorle", "Cereali e frutta secca", 21.0, 580, 20)
)
@Composable
private fun ProteinTable() {
    var category by remember { mutableStateOf("Tutte") }
    var portion by remember { mutableStateOf(false) }
    WhiteCard {
        Text("Fonti proteiche", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Muted("Tabella di consultazione, separata dal diario. Nessun alimento viene aggiunto automaticamente. I valori sono medi e variano secondo marca e preparazione.")
    }
    Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        listOf("Tutte", "Carne e pesce", "Latticini e uova", "Legumi e vegetali", "Cereali e frutta secca").forEach { c ->
            FilterChip(selected = category == c, onClick = { category = c }, label = { Text(c) })
        }
    }
    Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
        FilterChip(selected = !portion, onClick = { portion = false }, label = { Text("Per 100 g") })
        FilterChip(selected = portion, onClick = { portion = true }, label = { Text("Porzione esempio") })
    }
    WhiteCard {
        Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState())) {
            Text("Alimento", Modifier.width(150.dp), fontWeight = FontWeight.Bold)
            Text("Proteine", Modifier.width(78.dp), fontWeight = FontWeight.Bold)
            Text("Calorie", Modifier.width(82.dp), fontWeight = FontWeight.Bold)
            Text("Quantità", Modifier.width(85.dp), fontWeight = FontWeight.Bold)
        }
        proteinExamples.filter { category == "Tutte" || it.kind == category }.forEach { food ->
            HorizontalDivider(color = Mint)
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState())) {
                Text(food.name, Modifier.width(150.dp), style = MaterialTheme.typography.bodySmall)
                val protein = if (portion) food.protein * food.grams / 100.0 else food.protein
                val energy = if (portion) food.kcal * food.grams / 100 else food.kcal
                Text(String.format(Locale.ITALIAN, "%.1f g", protein), Modifier.width(78.dp), style = MaterialTheme.typography.bodySmall)
                Text("$energy kcal", Modifier.width(82.dp), style = MaterialTheme.typography.bodySmall)
                Text("${if (portion) food.grams else 100} g", Modifier.width(85.dp), style = MaterialTheme.typography.bodySmall)
            }
        }
    }
    WhiteCard {
        Text("Per sostenere la massa muscolare", fontWeight = FontWeight.Bold)
        Text("Allenamento di forza regolare, recupero e un’alimentazione varia e sufficiente sono tutti importanti. Le proteine non sostituiscono carboidrati, grassi e vegetali.")
        Muted("Quando mangi qualcosa, registralo nella scheda Cosa ho mangiato con la quantità reale e, se possibile, i valori dell’etichetta.")
    }
}
'''
p.write_text(s)
g=Path('FormaAndroid/app/build.gradle.kts'); t=g.read_text()
assert 'versionCode = 5' in t and 'versionName = "0.4.0"' in t
g.write_text(t.replace('versionCode = 5','versionCode = 6').replace('versionName = "0.4.0"','versionName = "0.4.1"'))
print("Forma 0.4.1: tabella proteica attivata")
