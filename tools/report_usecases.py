"""Create matching printable PNG and editable Draw.io use case diagrams."""
from pathlib import Path
from xml.etree import ElementTree as ET
from PIL import Image, ImageDraw, ImageFont
import math

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/diagrams/usecases'
WIDTH = 1600
INK = '#222222'
FONT = 'C:/Windows/Fonts/arial.ttf'
BOLD = 'C:/Windows/Fonts/arialbd.ttf'


def centered_text(draw, rect, text, size=40, bold=False):
    x, y, width, height = rect
    font = ImageFont.truetype(BOLD if bold else FONT, size)
    lines = text.split('\n')
    step = size * 1.24
    assert len(lines) * step <= height, (text, rect)
    for index, line in enumerate(lines):
        assert draw.textlength(line, font=font) <= width, (line, width)
        left = x + width / 2
        top = y + (height - len(lines) * step) / 2 + index * step
        draw.text((left, top), line, font=font, fill=INK, anchor='mt')


class UseCaseDiagram:
    def __init__(self, key, title, height, actor_y):
        self.key, self.title, self.height = key, title, height
        self.actor_y = actor_y
        self.nodes = []
        self.edges = []

    def node(self, key, label, rect):
        self.nodes.append({'id': key, 'label': label, 'rect': rect})

    def associate(self, target):
        node = next(node for node in self.nodes if node['id'] == target)
        x, y, width, height = node['rect']
        self.edges.append({'source': 'customer', 'target': target,
                           'points': [(215, self.actor_y), (x, y + height / 2)]})

    def include(self, source, target, points, label_box):
        self.edges.append({'source': source, 'target': target, 'points': points,
                           'include': True, 'label_box': label_box})

    def render(self):
        image = Image.new('RGB', (WIDTH, self.height), 'white')
        draw = ImageDraw.Draw(image)
        draw.rectangle((290, 20, 1580, self.height - 20), outline=INK, width=3)
        centered_text(draw, (310, 35, 1250, 58), 'PC-Astral Market', 43, True)
        centered_text(draw, (310, 91, 1250, 53), 'Website bán máy tính mô phỏng', 38)
        for edge in self.edges:
            points = edge['points']
            if not edge.get('include'):
                draw.line(points, fill=INK, width=3)
                continue
            for a, b in zip(points, points[1:]):
                length = math.dist(a, b)
                for start in range(0, math.ceil(length), 22):
                    end = min(start + 13, length)
                    p = (a[0] + (b[0] - a[0]) * start / length,
                         a[1] + (b[1] - a[1]) * start / length)
                    q = (a[0] + (b[0] - a[0]) * end / length,
                         a[1] + (b[1] - a[1]) * end / length)
                    draw.line([p, q], fill=INK, width=3)
            a, b = points[-2:]
            angle = math.atan2(b[1] - a[1], b[0] - a[0])
            for delta in (-.48, .48):
                tail = (b[0] - 22 * math.cos(angle + delta),
                        b[1] - 22 * math.sin(angle + delta))
                draw.line([tail, b], fill=INK, width=3)
            centered_text(draw, edge['label_box'], '«include»', 39)
        for node in self.nodes:
            x, y, width, height = node['rect']
            draw.ellipse((x, y, x + width, y + height), fill='white', outline=INK, width=3)
            centered_text(draw, (x + 25, y + 8, width - 50, height - 16), node['label'])
        # The actor's right arm is the common end of the association lines.
        cy = self.actor_y
        draw.ellipse((115, cy - 135, 175, cy - 75), fill='white', outline=INK, width=4)
        draw.line([(145, cy - 75), (145, cy + 55)], fill=INK, width=4)
        draw.line([(75, cy), (145, cy - 30), (215, cy)], fill=INK, width=4)
        draw.line([(90, cy + 135), (145, cy + 55), (200, cy + 135)], fill=INK, width=4)
        centered_text(draw, (10, cy + 155, 270, 60), 'Khách hàng', 40, True)
        image.save(OUT / (self.key + '.png'), dpi=(300, 300))

    def drawio_page(self, parent):
        page = ET.SubElement(parent, 'diagram', id=self.key, name=self.title)
        model = ET.SubElement(page, 'mxGraphModel', dx='1600', dy=str(self.height),
                              grid='1', gridSize='10', guides='1', tooltips='1',
                              connect='1', arrows='1', fold='1', page='1', pageScale='1',
                              pageWidth='1600', pageHeight=str(self.height), math='0', shadow='0')
        root = ET.SubElement(model, 'root')
        ET.SubElement(root, 'mxCell', id='0')
        ET.SubElement(root, 'mxCell', id='1', parent='0')

        def vertex(key, label, rect, style):
            cell = ET.SubElement(root, 'mxCell', id=key, value=label, style=style, vertex='1', parent='1')
            x, y, width, height = rect
            ET.SubElement(cell, 'mxGeometry', x=str(x), y=str(y), width=str(width),
                          height=str(height), attrib={'as': 'geometry'})

        base = 'fontFamily=Arial;fontColor=#222222;strokeColor=#222222;strokeWidth=3;'
        vertex('system', 'PC-Astral Market\nWebsite bán máy tính mô phỏng',
               (290, 20, 1290, self.height - 40),
               base + 'rounded=0;fillColor=none;verticalAlign=top;spacingTop=15;fontSize=40;whiteSpace=wrap;')
        vertex('customer', 'Khách hàng', (75, self.actor_y - 135, 140, 270),
               base + 'shape=umlActor;fillColor=#FFFFFF;fontSize=40;verticalLabelPosition=bottom;verticalAlign=top;')
        for node in self.nodes:
            vertex(node['id'], node['label'], node['rect'],
                   base + 'ellipse;whiteSpace=wrap;fillColor=#FFFFFF;fontSize=40;')
        for index, edge in enumerate(self.edges):
            include = edge.get('include', False)
            style = base + 'edgeStyle=none;rounded=0;html=0;endArrow=none;'
            if include:
                style += 'dashed=1;dashPattern=5 4;endArrow=open;endFill=0;fontSize=39;'
            else:
                style += 'exitX=1;exitY=0.5;exitPerimeter=0;entryX=0;entryY=0.5;entryPerimeter=0;'
            cell = ET.SubElement(root, 'mxCell', id='edge-' + str(index), value='',
                                 style=style, edge='1', parent='1',
                                 source=edge['source'], target=edge['target'])
            geometry = ET.SubElement(cell, 'mxGeometry', relative='1', attrib={'as': 'geometry'})
            if len(edge['points']) > 2:
                points = ET.SubElement(geometry, 'Array', attrib={'as': 'points'})
                for x, y in edge['points'][1:-1]:
                    ET.SubElement(points, 'mxPoint', x=str(x), y=str(y))
            if include:
                vertex('include-label-' + str(index), '«include»', edge['label_box'],
                       'text;html=0;strokeColor=none;fillColor=none;fontFamily=Arial;fontSize=39;fontColor=#222222;')


def make_usecases():
    OUT.mkdir(parents=True, exist_ok=True)
    overview = UseCaseDiagram('01-overview', 'Tổng quan', 1620, 790)
    labels = [
        'Tra cứu và chọn sản phẩm', 'Quản lý giỏ hàng', 'Đặt hàng mô phỏng',
        'Xem xác nhận đơn gần nhất', 'Đăng ký và đăng nhập', 'Xem giới thiệu và chính sách',
    ]
    for index, label in enumerate(labels):
        key = 'overview-' + str(index + 1)
        overview.node(key, label, (465, 185 + index * 235, 1040, 170))
        overview.associate(key)

    selection = UseCaseDiagram('02-find-select', 'Tìm và chọn sản phẩm', 1540, 760)
    labels = [
        ('UC01', 'Xem sản phẩm theo\ndanh mục hoặc nhóm'), ('UC02', 'Tìm kiếm sản phẩm'),
        ('UC03', 'Lọc sản phẩm'), ('UC04', 'Sắp xếp sản phẩm'),
        ('UC05', 'Xem chi tiết sản phẩm'), ('UC06', 'Thêm sản phẩm vào giỏ'),
    ]
    for index, (key, label) in enumerate(labels):
        selection.node(key, key + '\n' + label, (465, 180 + index * 220, 1040, 180))
        selection.associate(key)

    cart = UseCaseDiagram('03-cart-checkout', 'Giỏ hàng và đặt hàng', 1560, 760)
    labels = [
        ('UC06', 'Thêm sản phẩm vào giỏ'), ('UC07', 'Xem giỏ hàng'),
        ('UC08', 'Thay đổi số lượng'), ('UC09', 'Xóa sản phẩm khỏi giỏ'),
        ('UC10', 'Đặt hàng mô phỏng'), ('UC11', 'Xem xác nhận đơn\ngần nhất'),
    ]
    for index, (key, label) in enumerate(labels):
        cart.node(key, key + '\n' + label, (350, 155 + index * 230, 650, 170))
        cart.associate(key)
    cart.node('check-quantity', 'Kiểm tra\nsố lượng\ncho phép', (1120, 360, 440, 220))
    cart.node('check-customer', 'Kiểm tra\nthông tin\nđặt hàng', (1120, 1060, 440, 220))
    cart.include('UC06', 'check-quantity', [(1000, 240), (1340, 240), (1340, 360)], (1040, 175, 270, 55))
    cart.include('UC08', 'check-quantity', [(1000, 700), (1340, 700), (1340, 580)], (1040, 710, 270, 55))
    cart.include('UC10', 'check-customer', [(1000, 1160), (1050, 1160), (1050, 1000), (1340, 1000), (1340, 1060)], (1060, 935, 270, 55))

    mxfile = ET.Element('mxfile', host='app.diagrams.net', type='device', compressed='false')
    for diagram in (overview, selection, cart):
        diagram.render()
        diagram.drawio_page(mxfile)
    ET.indent(mxfile, space='  ')
    ET.ElementTree(mxfile).write(OUT / 'PC-Astral-Market-UseCases.drawio', encoding='utf-8', xml_declaration=True)
    return OUT


if __name__ == '__main__':
    print(make_usecases())
