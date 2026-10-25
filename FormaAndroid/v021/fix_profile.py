#!/usr/bin/env python3
"""Forma v0.2.1: patch profile persistence and backup restore after source restoration."""
from pathlib import Path
root=Path(__file__).resolve().parents[2]  # FormaAndroid/v021/fix_profile.py -> FormaAndroid
app=root/"app/src/main/java/it/forma/app"
screens=app/"ui/FormaScreens.kt"
store=app/"data/FormaStore.kt"
gradle=root/"app/build.gradle.kts"

def swap(text, old, new, label):
    if old not in text: raise SystemExit("Missing expected section: "+label)
    return text.replace(old,new,1)

a=store.read_text()
a=swap(a,
    '    fun changeName(name: String) = update(state.copy(displayName = name.take(40)))',
    r'''    fun changeName(rawName: String): Boolean {
        val clean = rawName.trim().replace(Regex("\\s+"), " ").take(40)
        if (clean.isBlank()) return false
        val next = state.copy(displayName = clean)
        // Confirm saving only after the phone stores the profile.
        val saved = preferences.edit().putString("state", serialize(next).toString()).commit()
        if (saved) state = next
        return saved
    }

    fun importData(jsonText: String): Boolean {
        val incoming = runCatching { JSONObject(jsonText.trim()) }.getOrNull() ?: return false
        if (!incoming.has("startDate") ||
            incoming.optJSONObject("completedSets") == null ||
            incoming.optJSONObject("checkIns") == null) return false
        val saved = preferences.edit().putString("state", incoming.toString()).commit()
        if (saved) state = readSnapshot()
        return saved
    }''',"store name persistence")
store.write_text(a)

s=screens.read_text()
s=swap(s,"import androidx.compose.foundation.Canvas",
"""import androidx.compose.foundation.Canvas
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions""","keyboard imports")
s=swap(s,"import androidx.compose.runtime.*",
"""import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable""","state import")
s=swap(s,"import androidx.compose.ui.Modifier",
"""import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.input.ImeAction""","focus imports")
s=swap(s,
'''    var name by remember { mutableStateOf(store.state.displayName) }
    var confirmRestart by remember { mutableStateOf(false) }
    var confirmExport by remember { mutableStateOf(false) }
    val appContext = LocalContext.current
    Page {''',
'''    var name by rememberSaveable { mutableStateOf(store.state.displayName) }
    var nameFeedback by rememberSaveable { mutableStateOf("") }
    var confirmRestart by remember { mutableStateOf(false) }
    var confirmExport by remember { mutableStateOf(false) }
    var confirmImport by remember { mutableStateOf(false) }
    var backupInput by remember { mutableStateOf("") }
    var backupFeedback by remember { mutableStateOf("") }
    val appContext = LocalContext.current
    val focusManager = LocalFocusManager.current
    val saveName = {
        val clean = name.trim()
        if (clean.isBlank()) {
            nameFeedback = "Inserisci prima un nome."
        } else if (store.changeName(clean)) {
            name = store.state.displayName
            nameFeedback = "✓ Nome salvato sul telefono: " + store.state.displayName
            focusManager.clearFocus()
        } else {
            nameFeedback = "Salvataggio non riuscito. Riprova."
        }
    }
    Page {''',"profile state and callback")
s=swap(s,
'''            OutlinedTextField(value = name, onValueChange = { name = it.take(40) }, label = { Text("Come preferisci essere chiamata?") }, modifier = Modifier.fillMaxWidth(), singleLine = true)
            Button(onClick = { store.changeName(name) }, modifier = Modifier.fillMaxWidth()) { Text("Salva il nome") }
            HorizontalDivider()''',
'''            OutlinedTextField(
                value = name,
                onValueChange = { name = it.take(40); nameFeedback = "" },
                label = { Text("Come preferisci essere chiamata?") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                keyboardActions = KeyboardActions(onDone = { saveName() })
            )
            Button(onClick = { saveName() }, enabled = name.isNotBlank(), modifier = Modifier.fillMaxWidth()) {
                Text("Salva il nome")
            }
            if (nameFeedback.isNotBlank()) {
                Text(nameFeedback, color = if (nameFeedback.startsWith("✓")) Forest else MaterialTheme.colorScheme.error)
            } else if (store.state.displayName.isNotBlank()) {
                Muted("Nome attualmente salvato: " + store.state.displayName)
            }
            HorizontalDivider()''',"profile editing controls")
s=swap(s,
'''            OutlinedButton(onClick = { confirmExport = true }, modifier = Modifier.fillMaxWidth()) { Text("Esporta una copia dei dati") }''',
'''            OutlinedButton(onClick = { confirmExport = true }, modifier = Modifier.fillMaxWidth()) { Text("Esporta una copia dei dati") }
            OutlinedButton(onClick = { confirmImport = true }, modifier = Modifier.fillMaxWidth()) { Text("Ripristina un backup JSON") }
            if (backupFeedback.isNotBlank()) Text(backupFeedback, color = Forest)''',"backup restore entry")
s=swap(s,
'        Muted("Forma · versione 0.2.0 · Progetto personale offline")',
'        Muted("Forma · versione 0.2.1 · Correzione salvataggio nome")',"version label")
s=swap(s,
'    if (confirmRestart) AlertDialog(',
'''    if (confirmImport) AlertDialog(
        onDismissRequest = { confirmImport = false },
        title = { Text("Ripristina un backup") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Incolla il JSON esportato dalla versione precedente. Questa operazione sostituirà i dati attuali.")
                OutlinedTextField(
                    value = backupInput,
                    onValueChange = { backupInput = it },
                    label = { Text("Testo del backup JSON") },
                    modifier = Modifier.fillMaxWidth(),
                    minLines = 3,
                    maxLines = 6
                )
                if (backupFeedback.isNotBlank()) Muted(backupFeedback)
            }
        },
        confirmButton = { TextButton(
            enabled = backupInput.isNotBlank(),
            onClick = {
                if (store.importData(backupInput)) {
                    backupFeedback = "✓ Backup ripristinato correttamente."
                    name = store.state.displayName
                    confirmImport = false
                    backupInput = ""
                } else {
                    backupFeedback = "Backup non valido o salvataggio non riuscito."
                }
            }
        ) { Text("Ripristina") } },
        dismissButton = { TextButton(onClick = { confirmImport = false }) { Text("Annulla") } }
    )
    if (confirmRestart) AlertDialog(''',"import backup dialog")
screens.write_text(s)

g=gradle.read_text()
g=swap(g,"versionCode = 2","versionCode = 3","version code")
g=swap(g,'versionName = "0.2.0"','versionName = "0.2.1"',"version name")
gradle.write_text(g)
print("Forma 0.2.1 profile patch applied")
