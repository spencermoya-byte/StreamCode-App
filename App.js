import { useState, useRef, useEffect } from 'react';
import {
  View, Text, Image, Pressable, ScrollView, ActivityIndicator,
  StyleSheet, Dimensions, useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

/* =====================================================================
   StreamCode — standalone native iOS app
   The UI is fully native. Codes come from the Pi backend over HTTPS.
   DEMO_MODE simulates a code so the app runs before the backend is live.
   ===================================================================== */

const DEMO_MODE = true;                       // flip to false to use the Pi
const API_BASE  = 'https://REPLACE-WITH-YOUR-PI-URL.ts.net';  // Pi HTTPS address

const PLATFORMS = [
  { id: 'netflix',   name: 'Netflix',     logo: require('./assets/logos/netflix.png') },
  { id: 'hulu',      name: 'Hulu',        logo: require('./assets/logos/hulu.jpg') },
  { id: 'disney',    name: 'Disney+',     logo: require('./assets/logos/disney.jpg') },
  { id: 'max',       name: 'Max',         logo: require('./assets/logos/max.jpg') },
  { id: 'peacock',   name: 'Peacock',     logo: require('./assets/logos/peacock.png') },
  { id: 'prime',     name: 'Prime Video', logo: require('./assets/logos/prime.png') },
  { id: 'paramount', name: 'Paramount+',  logo: require('./assets/logos/paramount.jpg') },
];

const C = {
  bg: '#0d0f0e', surface: '#16191a', line: '#2a2f31', tile: '#0a0a0a',
  text: '#e8edeb', muted: '#8a9491', accent: '#4cd964', accentBright: '#4fffb0',
};

export default function App() {
  const [screen, setScreen] = useState('grid');   // grid | wait | code
  const [platform, setPlatform] = useState(null);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const poll = useRef(null);

  const { width } = useWindowDimensions();
  const PAD = 22, GAP = 14;
  const tileW = (width - PAD * 2 - GAP) / 2;
  const tileH = tileW * 0.62;

  useEffect(() => () => stop(), []);
  function stop() {
    if (poll.current) { clearTimeout(poll.current); clearInterval(poll.current); poll.current = null; }
  }

  function claim(p) {
    setPlatform(p); setCode(''); setCopied(false); setScreen('wait');

    if (DEMO_MODE) {
      poll.current = setTimeout(() => {
        const c = String(Math.floor(100000 + Math.random() * 900000));
        showCode(c);
      }, 3000);
      return;
    }
    // real backend
    fetch(`${API_BASE}/api/claim`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: p.id }),
    }).catch(() => {});
    const start = Date.now();
    poll.current = setInterval(async () => {
      if (Date.now() - start > 120000) { stop(); return; }
      try {
        const r = await fetch(`${API_BASE}/api/code?platform=${p.id}`);
        const data = await r.json();
        if (data && data.code) showCode(data.code);
      } catch (e) {}
    }, 1000);
  }

  function showCode(c) { stop(); setCode(c); setScreen('code'); }

  async function copy() {
    await Clipboard.setStringAsync(code);
    setCopied(true);
  }

  return (
    <SafeAreaView style={s.root} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      {/* header */}
      <View style={s.header}>
        <Text style={s.brand}><Text style={s.brandMark}>{'‹/›'}</Text>  StreamCode</Text>
      </View>

      {screen === 'grid' && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: PAD, paddingBottom: 28 }}>
          <Text style={s.h1}>Get a code</Text>
          <Text style={s.sub}>Tap the platform you're signing into. The code shows up here automatically.</Text>
          <View style={[s.grid, { gap: GAP, marginTop: 22 }]}>
            {PLATFORMS.map(p => (
              <Pressable key={p.id} onPress={() => claim(p)}
                style={({ pressed }) => [s.tile, { width: tileW, height: tileH, opacity: pressed ? 0.85 : 1 }]}>
                <Image source={p.logo} style={s.tileImg} resizeMode="cover" accessibilityLabel={p.name} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}

      {screen === 'wait' && (
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.accent} />
          <Text style={s.waitName}>{platform?.name}</Text>
          <Text style={s.waitSub}>Watching the family inbox for your code. Trigger "Send code" on the platform now if you haven't.</Text>
          <Pressable onPress={() => { stop(); setScreen('grid'); }} style={s.ghostBtn}>
            <Text style={s.ghostTxt}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {screen === 'code' && (
        <View style={s.center}>
          <View style={s.codeBox}>
            <Text style={s.cap}>{platform?.name} CODE</Text>
            <Text style={s.code}>{code}</Text>
            <Text style={s.codeMeta}>Just now · {platform?.name}</Text>
          </View>
          <Text style={s.copied}>{copied ? 'Copied ✓' : ' '}</Text>
          <Pressable onPress={copy} style={s.btn}><Text style={s.btnTxt}>Copy code</Text></Pressable>
          <Pressable onPress={() => setScreen('grid')} style={s.ghostBtn}><Text style={s.ghostTxt}>Done</Text></Pressable>
        </View>
      )}

      {DEMO_MODE && <Text style={s.demo}>Demo mode · codes are simulated</Text>}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { alignItems: 'center', paddingVertical: 14 },
  brand: { color: C.text, fontSize: 15, fontWeight: '700', fontVariant: ['tabular-nums'] },
  brandMark: { color: C.accentBright },
  h1: { color: C.text, fontSize: 25, fontWeight: '700', marginTop: 6 },
  sub: { color: C.muted, fontSize: 15, marginTop: 8, lineHeight: 21 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: { backgroundColor: C.tile, borderRadius: 18, overflow: 'hidden' },
  tileImg: { width: '100%', height: '100%' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18, paddingHorizontal: 22 },
  waitName: { color: C.text, fontSize: 18, fontWeight: '700' },
  waitSub: { color: C.muted, fontSize: 14, textAlign: 'center', maxWidth: 280, lineHeight: 20 },
  codeBox: { backgroundColor: C.surface, borderColor: C.line, borderWidth: 1, borderRadius: 20, padding: 28, alignItems: 'center', width: 300 },
  cap: { color: C.muted, fontSize: 13, letterSpacing: 1.5 },
  code: { color: C.accentBright, fontSize: 46, fontWeight: '700', letterSpacing: 6, marginVertical: 10, fontVariant: ['tabular-nums'] },
  codeMeta: { color: C.muted, fontSize: 13 },
  copied: { color: C.accent, fontSize: 13, height: 16 },
  btn: { backgroundColor: C.surface, borderColor: C.line, borderWidth: 1, borderRadius: 13, paddingVertical: 14, width: 300, alignItems: 'center' },
  btnTxt: { color: C.text, fontSize: 15, fontWeight: '600' },
  ghostBtn: { paddingVertical: 12, width: 300, alignItems: 'center' },
  ghostTxt: { color: C.muted, fontSize: 15, fontWeight: '600' },
  demo: { color: C.muted, fontSize: 11, textAlign: 'center', paddingVertical: 12, opacity: 0.7 },
});
