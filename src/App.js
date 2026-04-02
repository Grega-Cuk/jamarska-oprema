import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

/** ---------------------------
 *  Nabor opreme
 * --------------------------- */
const EQUIPMENT_OPTIONS = [
  "Čelada",
  "Sp. del pasu",
  "Zg. del pasu",
  "D vponka",
  "Zavora",
  "Ročni žimar",
  "Prsni žimar",
  "Dodatna vponka",
  "Oval vponka",
  "Vponke popkovina",
  "Rezervna luč",
  "Prusik",
  "Kombinezon",
  "Stopna zanka",
  "Nožni žimar",
  "Podkombinezon",
  "Mini transportna vreča"
];

/** ---------------------------
 *  Component
 * --------------------------- */
export default function App() {
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [entries, setEntries] = useState([]);
  const [allChecks, setAllChecks] = useState([]);

  /** ---------------------------
   *  Ob prvem zagonu naloži člane
   * --------------------------- */
  useEffect(() => {
    const savedMembers = JSON.parse(localStorage.getItem("members")) || [];
    setMembers(["Izberi člana", ...savedMembers]);
  }, []);

  /** ---------------------------
   *  Naloži vse preglede
   * --------------------------- */
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("allChecks")) || [];
    setAllChecks(saved);
  }, []);

  /** ---------------------------
   *  Dodaj novega člana
   * --------------------------- */
  const addMemberFunc = () => {
    if (!newMember.trim()) return;

    const cleaned = [...members.slice(1), newMember].sort((a, b) =>
      a.localeCompare(b)
    );

    setMembers(["Izberi člana", ...cleaned]);
    localStorage.setItem("members", JSON.stringify(cleaned));
    setNewMember("");
  };

  /** ---------------------------
   *  Dodaj kos opreme
   * --------------------------- */
  const addEntry = () => {
    setEntries([
      ...entries,
      {
        id: Date.now(),
        oprema: "",
        serijska: "",
        stanje: "",
        opombe: "",
        ukrep: ""
      }
    ]);
  };

  /** ---------------------------
   *  Posodobi polje
   * --------------------------- */
  const updateField = (id, field, value) => {
    setEntries(entries.map(e => (e.id === id ? { ...e, value } : e)));
  };

  /** ---------------------------
   *  Zaključi pregled
   * --------------------------- */
  const finishCheck = () => {
    if (!selectedMember || entries.length === 0) return;

    const record = {
      member: selectedMember,
      items: entries,
      date: new Date().toLocaleString()
    };

    const updated = [...allChecks, record];

    setAllChecks(updated);
    localStorage.setItem("allChecks", JSON.stringify(updated));

    // reset
    setSelectedMember("");
    setEntries([]);
  };

  /** ---------------------------
   *  Izvoz v CSV
   * --------------------------- */
  const exportCSV = () => {
    let csv = "Član;Oprema;Serijska;Stanje;Opombe;Ukrep;Datum\n";

    allChecks.forEach(check => {
      check.items.forEach(i => {
        csv += `${check.member};${i.oprema};${i.serijska};${i.stanje};${i.opombe};${i.ukrep};${check.date}\n`;
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "pregledi_opreme.csv";
    a.click();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">
        Pregled jamarske opreme
      </h1>

      {/* Dodaj novega člana */}
      <Card className="p-4 border rounded-2xl shadow-md">
        <CardContent className="space-y-3">
          <h2 className="font-semibold text-lg">Dodaj novega člana</h2>

          <div className="flex gap-3">
            <Input
              placeholder="Ime in priimek"
              value={newMember}
              onChange={e => setNewMember(e.target.value)}
            />
            <Button onClick={addMemberFunc}>Dodaj</Button>
          </div>
        </CardContent>
      </Card>

      {/* Izbor člana */}
      <Card className="p-4 border rounded-2xl shadow-md">
        <CardContent>
          <Select onValueChange={setSelectedMember} value={selectedMember}>
            <SelectTrigger>
              <SelectValue placeholder="Izberi člana" />
            </SelectTrigger>

            <SelectContent>
              {members.map(m => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Obrazec za vnos opreme */}
      {selectedMember && selectedMember !== "Izberi člana" && (
        <>
          {entries.map(entry => (
            <Card key={entry.id} className="p-4 border rounded-2xl shadow-md">
              <CardContent className="space-y-4">
                {/* Izbor opreme */}
                <Select
                  onValueChange={v => updateField(entry.id, "oprema", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Izberi opremo" />
                  </SelectTrigger>

                  <SelectContent>
                    {EQUIPMENT_OPTIONS.map(item => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Serijska številka"
                  value={entry.serijska}
                  onChange={e =>
                    updateField(entry.id, "serijska", e.target.value)
                  }
                />

                <Select
                  onValueChange={v => updateField(entry.id, "stanje", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Stanje" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dobro">✓ Dobro</SelectItem>
                    <SelectItem value="opozorilo">⚠ Opozorilo</SelectItem>
                    <SelectItem value="izlociti">✖ Izločiti</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Opombe"
                  value={entry.opombe}
                  onChange={e =>
                    updateField(entry.id, "opombe", e.target.value)
                  }
                />

                <Input
                  placeholder="Ukrep"
                  value={entry.ukrep}
                  onChange={e =>
                    updateField(entry.id, "ukrep", e.target.value)
                  }
                />
              </CardContent>
            </Card>
          ))}

          <div className="text-center space-y-3">
            <Button onClick={addEntry}>Dodaj kos opreme</Button>
            <Button className="bg-green-600 text-white" onClick={finishCheck}>
              Zaključi pregled
            </Button>
          </div>
        </>
      )}

      {/* Zbirnik vseh pregledov */}
      <Card className="p-4 border rounded-2xl shadow-md">
        <CardContent className="space-y-4">
          <h2 className="font-semibold text-lg">Pregledi vseh članov</h2>

          {allChecks.length === 0 && <p>Ni še izvedenih pregledov.</p>}

          {allChecks.map((c, i) => (
            <div key={i} className="border-b pb-3 mb-3">
              <strong>{c.member}</strong> — {c.date}
              <ul className="list-disc ml-6 text-sm">
                {c.items.map(it => (
                  <li key={it.id}>
                    {it.oprema} ({it.stanje}) — {it.ukrep}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <Button className="bg-blue-600 text-white" onClick={exportCSV}>
            Izvozi v Excel (CSV)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
